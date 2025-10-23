import { Module } from '@nestjs/common';
import { HelpersService } from './helpers.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [],
  providers: [HelpersService, PrismaService],
  exports: [],
})
export class HelpersModule {}
