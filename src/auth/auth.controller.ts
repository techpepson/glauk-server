import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from 'src/dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async manualRegister(payload: AuthDto) {
    const registration = await this.authService.manualRegister(payload);
    return {
      message: registration.message,
    };
  }
  
  @Post('login')
  async manualLogin(payload: AuthDto) {
    const login = await this.authService.manualLogin(payload);
    return {
      message: login.message,
    };
  }

  @Get('verify-email')
  async verifyEmail(
    @Query('email') email: string,
    @Query('code') code: string,
  ) {
    const verification = await this.authService.verifyEmail(email, code);
    return {
      message: verification.message,
    };
  }

  @Get('google/callback')
  async googleCallback() {}
}
