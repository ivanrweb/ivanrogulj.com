import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

export class LoginDto {
  public username!: string;
  public password!: string;
}

@Controller('auth')
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(@Body() dto: LoginDto): Promise<{ access_token: string }> {
    return this.authService.login(dto.username, dto.password);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  public async register(@Body() dto: LoginDto): Promise<void> {
    return this.authService.register(dto.username, dto.password);
  }
}
