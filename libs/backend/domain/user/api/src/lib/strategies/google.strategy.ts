import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  public constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') ?? 'not-configured',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') ?? 'not-configured',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') ?? 'http://localhost:3000/api/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  public validate(
    _accessToken: string,
    _refreshToken: string,
    profile: { id: string; emails: Array<{ value: string }> },
    done: VerifyCallback,
  ): void {
    const { id, emails } = profile;
    done(null, { googleId: id, email: emails[0].value });
  }
}
