import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { getRequiredJwtSecret } from '@ivanrogulj.com/backend/core/config';

@Injectable()
export class UserAuthGuard implements CanActivate {
  public constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request & { user?: { userId: string; email: string } }>();
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) throw new UnauthorizedException('No token provided');
    try {
      const payload = this.jwtService.verify<{ sub: string; email: string }>(token, {
        secret: getRequiredJwtSecret(this.configService),
      });
      req.user = { userId: payload.sub, email: payload.email };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
