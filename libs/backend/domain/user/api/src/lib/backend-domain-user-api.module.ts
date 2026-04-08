import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { BackendDomainUserDataAccessModule } from '@ivanrogulj.com/backend/domain/user/data-access';
import { BackendCoreMailModule } from '@ivanrogulj.com/backend/core/mail';
import { UserAuthService } from './user-auth.service';
import { UserAuthController } from './user-auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    PassportModule,
    BackendDomainUserDataAccessModule,
    BackendCoreMailModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') ?? 'default-secret',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [UserAuthController],
  providers: [UserAuthService, GoogleStrategy],
})
export class BackendDomainUserApiModule {}
