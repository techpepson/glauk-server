import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { AuthDto } from 'src/dto/auth.dto';
import { HelpersService } from 'src/helpers/helpers.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helper: HelpersService,
  ) {}

  logger = new Logger(AuthService.name);

  async manualRegister(payload: AuthDto) {
    try {
      const userExist = await this.helper.userExist(payload.email);

      if (userExist === true) {
        throw new ConflictException('User already exists');
      }

      //create a new user into the system
      await this.prisma.user.create({
        data: {
          email: payload.email,
          password: payload.password,
          userName: payload.userName,
          name: payload.name,
          phone: payload.phone,
        },
      });

      //send email to user to verify their email
      
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw new ConflictException('User already exists');
      } else {
        throw error.message;
      }
    }
  }
}
