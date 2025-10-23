import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HelpersService {
  constructor(private readonly prisma: PrismaService) {}

  logger = new Logger(HelpersService.name);

  //async helper method to check if a user exists
  async userExist(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    //send an error if user does not exist
    if (user) {
      return true;
    } else {
      return false;
    }
  }

  async userEmailVerified(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    //send an error if user does not exist
    if (user?.isEmailVerified === true) {
      return true;
    } else {
      return false;
    }
  }
}
