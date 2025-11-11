import { MailerService } from '@nestjs-modules/mailer';
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HelpersService } from '../helpers/helpers.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from '../dto/auth.dto';
import { TooManyRequestsException } from '../exceptions/too-many-exceptions';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helper: HelpersService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  logger = new Logger(AuthService.name);

  async manualRegister(payload: AuthDto) {
    try {
      const user = (await this.helper.userExist(payload.email)).user;

      //check if user
      if (user) {
        throw new ConflictException('User already exists');
      }

      //send email to user to verify their email
      const verificationCode = await this.helper.generateRandomCode(6);

      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(payload.password, salt);

      const appBaseUrl = this.configService.get<string>('app.appBaseUrl');
      const verificationUrl = `${appBaseUrl}/verify-email?code=${verificationCode}&email=${payload.email}`;

      const mail = await this.mailerService.sendMail({
        to: payload.email,
        subject: 'Email Verification - Glauk',
        template: 'email-verification', // The `.hbs` extension is appended automatically
        context: {
          verificationCode,
          expirationMinutes: 20,
          name: payload.name,
          appName: this.configService.get<string>('app.appName'),
          logoUrl: this.configService.get('app.appLogoUrl'),
          supportEmail: this.configService.get('app.supportEmail'),
          verifyUrl: verificationUrl,
        },
      });

      const now = new Date();

      const splitName = payload.name.split(' ');
      const firstName = splitName[0];

      //create a new user into the system
      if (mail.accepted.length > 0) {
        await this.prisma.user.create({
          data: {
            email: payload.email,
            verificationCode,
            password: hashedPassword,
            userName: `${'shark_'}${firstName}`.toLowerCase(),
            name: payload.name,
            phone: payload.phone,
            verificationCodeSentAt: now,
          },
        });

        return {
          message:
            'Registration successful. Please check your email to verify your account.',
        };
      } else {
        throw new InternalServerErrorException(
          'Failed to send verification email. Please try again later.',
        );
      }
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw new ConflictException('User already exists');
      }
      if (error instanceof TooManyRequestsException) {
        throw new TooManyRequestsException(
          'Too many registration attempts. Please try again later.',
        );
      }
      this.logger.error(`Error in manualRegister: ${error.message}`);
      throw new InternalServerErrorException(
        'An error occurred during registration. Please try again later.',
      );
    }
  }

  async verifyEmail(email: string, code: string) {
    try {
      const user = (await this.helper.userExist(email)).user;

      //check if user exists
      if (!user) {
        throw new NotFoundException('User does not exist');
      }

      if (user?.isEmailVerified) {
        throw new ConflictException('Email is already verified');
      }

      if (user?.verificationCode !== code) {
        throw new ConflictException('Invalid verification code');
      }

      await this.prisma.user.update({
        where: { email },
        data: { isEmailVerified: true },
      });

      return { message: 'Email verified successfully', success: true };
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw new ConflictException(
          'Email is already verified or invalid verification code',
        );
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User does not exist');
      }
      if (error instanceof TooManyRequestsException) {
        throw new TooManyRequestsException(
          'Too many verification attempts. Please try again later.',
        );
      }
      this.logger.error(`Error in verifyEmail: ${error.message}`);
      throw new InternalServerErrorException(
        'An error occurred during email verification. Please try again later.',
      );
    }
  }

  async manualLogin(payload: AuthDto) {
    try {
      const user = (await this.helper.userExist(payload.email)).user;

      //check if user exists
      if (!user) {
        throw new NotFoundException('Account not found');
      }

      const isEmailVerified = await this.helper.userEmailVerified(
        payload.email,
      );

      const userPass = user?.password || '';
      const isPasswordMatching = await bcrypt.compare(
        payload.password,
        userPass,
      );

      if (!isPasswordMatching) {
        throw new ConflictException('Invalid credentials');
      }
      if (!isEmailVerified) {
        throw new ConflictException('Email is not verified');
      }

      //update user first time login flag
      if (user?.isFirstTimeUser) {
        await this.prisma.user.updateMany({
          where: { email: payload.email },
          data: { isFirstTimeUser: false },
        });
      }

      //sign user credentials and generate token
      const token = this.jwtService.sign({
        id: user?.id,
        email: user?.email,
      });
      return {
        message: 'Login successful',
        isFirstTimeUser: user?.isFirstTimeUser,
        isUserRemembered: user?.isUserRemembered || false,
        role: user?.role,
        token,
      };
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof TooManyRequestsException) {
        throw new TooManyRequestsException(
          'Too many login attempts. Please try again later.',
        );
      }

      throw new InternalServerErrorException(
        'An error occurred during login. Please try again later.',
      );
    }
  }

  async googleAuth(
    email: string,
    firstName: string,
    lastName: string,
    profilePicture: string,
  ) {
    try {
      let user: any;

      const storedUserInCache = await this.cacheManager.get('glauk_user');

      if (storedUserInCache) {
        user = storedUserInCache;
      } else {
        user = (await this.helper.userExist(email)).user;
        await this.cacheManager.set('glauk_user', user); //cache for 5 minutes
      }

      //check if user exists
      if (user && !user.isEmailVerified) {
        throw new PreconditionFailedException('Email is not verified');
      } else if (user && user.isEmailVerified) {
        const token = this.jwtService.sign({
          id: user.id,
          email: user.email,
        });
        return {
          message: 'Login successful',
          token,
          isFirstTimeUser: user.isFirstTimeUser,
          isUserRemembered: user.isUserRemembered || false,
          role: user.role,
        };
      } else if (!user) {
        const verificationCode = await this.helper.generateRandomCode(6);

        const appBaseUrl = this.configService.get<string>('app.appBaseUrl');
        const verificationUrl = `${appBaseUrl}/verify-email?code=${verificationCode}&email=${email}`;

        //send an email to the user to verify email address
        const mail = await this.mailerService.sendMail({
          to: email,
          subject: 'Email Verification - Glauk',
          template: 'email-verification', // The `.hbs` extension is appended automatically
          context: {
            verificationCode,
            expirationMinutes: 20,
            name: `${firstName} ${lastName}`,
            appName: this.configService.get<string>('app.appName'),
            logoUrl: this.configService.get('app.appLogoUrl'),
            supportEmail: this.configService.get('app.supportEmail'),
            verifyUrl: verificationUrl,
          },
        });

        const now = new Date();
        if (mail.accepted.length > 0) {
          const newUser = await this.prisma.user.create({
            data: {
              email,
              name: `${firstName} ${lastName}`,
              isEmailVerified: false,
              isFirstTimeUser: true,
              password: '',
              phone: '',
              verificationCodeSentAt: now,
              verificationCode,
              userName: `${'shark_'}${firstName}`.toLowerCase(),
              profileImage: profilePicture,
            },
          });
          return {
            message: 'Registration successful. Please verify your email.',
            isFirstTimeUser: newUser.isFirstTimeUser,
            isFirstTimeRegister: true,
            isUserRemembered: newUser.isUserRemembered || false,
            role: newUser.role,
          };
        } else {
          throw new InternalServerErrorException(
            'Failed to send verification email. Please try again later.',
          );
        }
      }
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof PreconditionFailedException) {
        throw new PreconditionFailedException(error.message);
      }
      this.logger.error(`Error in googleAuth: ${error.message}`);

      throw new InternalServerErrorException(
        'An error occurred during Google authentication. Please try again later.',
      );
    }
  }

  async resetPassword(email: string, newPassword: string, oldPassword: string) {
    try {
      let user: any;

      const storedUserInCache = await this.cacheManager.get('glauk_user');

      if (storedUserInCache) {
        user = storedUserInCache;
      } else {
        user = (await this.helper.userExist(email)).user;
        await this.cacheManager.set('glauk_user', user); //cache for 5 minutes
      }

      if (!user) {
        throw new NotFoundException('User does not exist');
      }

      const isOldPasswordValid = await bcrypt.compare(
        oldPassword,
        user.password,
      );

      if (!isOldPasswordValid) {
        throw new ConflictException('Old password is incorrect');
      }

      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await this.prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });

      return { message: 'Password reset successful' };
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User does not exist');
      }
      this.logger.error(`Error in resetPassword: ${error.message}`);
      throw new InternalServerErrorException(
        'An error occurred during password reset. Please try again later.',
      );
    }
  }

  async rememberUser(email: string, remember: boolean) {
    try {
      let user: any;

      const storedUserInCache = await this.cacheManager.get('glauk_user');

      if (storedUserInCache) {
        user = storedUserInCache;
      } else {
        user = (await this.helper.userExist(email)).user;
        await this.cacheManager.set('glauk_user', user); //cache for 5 minutes
      }

      if (!user) {
        throw new NotFoundException('User does not exist');
      }

      await this.prisma.user.update({
        where: { email },
        data: { isUserRemembered: remember },
      });

      return { message: 'User preference updated successfully' };
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User does not exist');
      }
      this.logger.error(`Error in rememberUser: ${error.message}`);
      throw new InternalServerErrorException(
        'An error occurred while updating user preference. Please try again later.',
      );
    }
  }

  async deleteAccount(email: string) {
    const user = (await this.helper.userExist(email)).user;

    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    //perform hard-delete
    await this.prisma.user.delete({
      where: {
        email,
      },
    });

    return {
      message: 'Account deleted successfully.',
    };
  }

  async updateDetails() {}
}
