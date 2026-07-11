import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { getRequiredJwtSecret } from '@ivanrogulj.com/backend/core/config';

interface JwtPayload {
  sub: string;
  username: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  public constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getRequiredJwtSecret(configService),
    });
  }

  public validate(payload: JwtPayload): { userId: string; username: string } {
    return { userId: payload.sub, username: payload.username };
  }
}
