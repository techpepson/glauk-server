import { MailerService } from '@nestjs-modules/mailer';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthDto } from 'src/dto/auth.dto';
import { HelpersService } from 'src/helpers/helpers.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import e from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helper: HelpersService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  logger = new Logger(AuthService.name);

  async manualRegister(payload: AuthDto) {
    try {
      const userExist = await this.helper.userExist(payload.email);

      if (userExist === true) {
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

      //create a new user into the system
      if (mail.accepted.length > 0) {
        await this.prisma.user.create({
          data: {
            email: payload.email,
            verificationCode,
            password: hashedPassword,
            userName: payload.userName,
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
        return {
          message: 'Failed to send verification email. Please try again later.',
        };
      }
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw new ConflictException('User already exists');
      }
      this.logger.error(`Error in manualRegister: ${error.message}`);
      throw new InternalServerErrorException(
        'An error occurred during registration. Please try again later.',
      );
    }
  }

  async verifyEmail(email: string, code: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      const userExists = await this.helper.userExist(email);

      //check if user exists
      if (!userExists) {
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

      return { message: 'Email verified successfully' };
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw new ConflictException(
          'Email is already verified or invalid verification code',
        );
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User does not exist');
      }
      this.logger.error(`Error in verifyEmail: ${error.message}`);
      throw new InternalServerErrorException(
        'An error occurred during email verification. Please try again later.',
      );
    }
  }

  async manualLogin(payload: AuthDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: payload.email },
      });

      const userExists = await this.helper.userExist(payload.email);

      //check if user exists
      if (!userExists) {
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

      //check if password matches
      if (user?.password !== payload.password) {
        throw new ConflictException('Invalid credentials');
      }

      return {
        message: 'Login successful',
        isFirstTimeUser: user?.isFirstTimeUser,
        isUserRemembered: user?.isUserRemembered || false,
        role: user?.role,
      };
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }

      throw new InternalServerErrorException(
        'An error occurred during login. Please try again later.',
      );
    }
  }

  async googleAuth() {}
}
