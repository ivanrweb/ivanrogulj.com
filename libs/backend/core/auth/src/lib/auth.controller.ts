import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  public username!: string;

  @IsString()
  @MinLength(8)
  public password!: string;
}

@Controller('auth')
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  public async login(@Body() dto: LoginDto): Promise<{ access_token: string }> {
    return this.authService.login(dto.username, dto.password);
  }

  @Post('register')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.CREATED)
  public async register(@Body() dto: LoginDto): Promise<void> {
    return this.authService.register(dto.username, dto.password);
  }
}
