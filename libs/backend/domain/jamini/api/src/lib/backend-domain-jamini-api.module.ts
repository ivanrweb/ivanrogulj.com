import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BackendDomainJaminiDataAccessModule } from '@ivanrogulj.com/backend/domain/jamini/data-access';
import { JaminiService } from './jamini.service';
import { JaminiController } from './jamini.controller';
import { UserAuthGuard } from './guards/user-auth.guard';

@Module({
  imports: [
    ConfigModule,
    BackendDomainJaminiDataAccessModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') ?? 'default-secret',
      }),
    }),
  ],
  controllers: [JaminiController],
  providers: [JaminiService, UserAuthGuard],
})
export class BackendDomainJaminiApiModule {}
