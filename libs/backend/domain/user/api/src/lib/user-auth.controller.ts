import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { UserAuthService } from './user-auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth/user')
@SkipThrottle({ 'ai-short': true, 'ai-daily': true, newsletter: true, 'newsletter-daily': true })
export class UserAuthController {
  public constructor(
    private readonly userAuthService: UserAuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.CREATED)
  public async register(@Body() dto: RegisterUserDto): Promise<{ message: string }> {
    await this.userAuthService.register(dto.email, dto.password, dto.firstName, dto.lastName);
    return { message: 'Registration successful. Please check your email to confirm your account.' };
  }

  @Get('confirm-email')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  public async confirmEmail(@Query('token') token: string): Promise<{ message: string }> {
    await this.userAuthService.confirmEmail(token);
    return { message: 'Email confirmed successfully.' };
  }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  public async login(@Body() dto: LoginUserDto): Promise<{ access_token: string }> {
    return this.userAuthService.login(dto.email, dto.password);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  public googleAuth(): void {
    // Passport handles the redirect
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  public async googleCallback(
    @Req() req: { user: { googleId: string; email: string } },
    @Res() res: Response,
  ): Promise<void> {
    const { access_token } = await this.userAuthService.handleGoogleCallback(
      req.user.googleId,
      req.user.email,
    );
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:4200';
    res.redirect(`${frontendUrl}/login?token=${access_token}`);
  }
}
