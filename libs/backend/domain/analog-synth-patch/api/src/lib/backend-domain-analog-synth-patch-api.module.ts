import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BackendDomainAnalogSynthPatchDataAccessModule } from '@ivanrogulj.com/backend/domain/analog-synth-patch/data-access';
import { getRequiredJwtSecret } from '@ivanrogulj.com/backend/core/config';
import { AnalogSynthPatchService } from './analog-synth-patch.service';
import { AnalogSynthPatchController } from './analog-synth-patch.controller';
import { UserAuthGuard } from './guards/user-auth.guard';

@Module({
  imports: [
    ConfigModule,
    BackendDomainAnalogSynthPatchDataAccessModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: getRequiredJwtSecret(configService),
      }),
    }),
  ],
  controllers: [AnalogSynthPatchController],
  providers: [AnalogSynthPatchService, UserAuthGuard],
})
export class BackendDomainAnalogSynthPatchApiModule {}
