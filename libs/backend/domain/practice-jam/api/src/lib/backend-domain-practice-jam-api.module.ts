import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BackendDomainPracticeJamDataAccessModule } from '@ivanrogulj.com/backend/domain/practice-jam/data-access';
import { PracticeJamService } from './practice-jam.service';
import { PracticeJamController } from './practice-jam.controller';
import { UserAuthGuard } from './guards/user-auth.guard';

@Module({
  imports: [
    ConfigModule,
    BackendDomainPracticeJamDataAccessModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') ?? 'default-secret',
      }),
    }),
  ],
  controllers: [PracticeJamController],
  providers: [PracticeJamService, UserAuthGuard],
})
export class BackendDomainPracticeJamApiModule {}
