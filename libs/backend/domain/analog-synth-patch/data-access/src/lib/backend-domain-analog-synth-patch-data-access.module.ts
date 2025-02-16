import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalogSynthPatchEntity } from './entity/analog-synth-patch.entity';
import { AnalogSynthPatchRepository } from './repo/analog-synth-patch.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AnalogSynthPatchEntity])],
  providers: [AnalogSynthPatchRepository],
  exports: [],
})
export class BackendDomainAnalogSynthPatchDataAccessModule {}
