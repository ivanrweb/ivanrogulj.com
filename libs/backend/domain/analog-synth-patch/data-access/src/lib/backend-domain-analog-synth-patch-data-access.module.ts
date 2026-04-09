import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalogSynthPatchEntity } from './entity/analog-synth-patch.entity';
import { AnalogSynthPatchLfoEntity } from './entity/analog-synth-patch-lfo.entity';
import { AnalogSynthPatchSequencerEntity } from './entity/analog-synth-patch-sequencer.entity';
import { AnalogSynthPatchEffectsEntity } from './entity/analog-synth-patch-effects.entity';
import { AnalogSynthPatchJsonEntity } from './entity/analog-synth-patch-json.entity';
import { AnalogSynthPatchRepository } from './repo/analog-synth-patch.repository';
import { AnalogSynthPatchLfoRepository } from './repo/analog-synth-patch-lfo.repository';
import { AnalogSynthPatchSequencerRepository } from './repo/analog-synth-patch-sequencer.repository';
import { AnalogSynthPatchEffectsRepository } from './repo/analog-synth-patch-effects.repository';
import { AnalogSynthPatchJsonRepository } from './repo/analog-synth-patch-json.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalogSynthPatchEntity,
      AnalogSynthPatchLfoEntity,
      AnalogSynthPatchSequencerEntity,
      AnalogSynthPatchEffectsEntity,
      AnalogSynthPatchJsonEntity,
    ]),
  ],
  providers: [
    AnalogSynthPatchRepository,
    AnalogSynthPatchLfoRepository,
    AnalogSynthPatchSequencerRepository,
    AnalogSynthPatchEffectsRepository,
    AnalogSynthPatchJsonRepository,
  ],
  exports: [
    AnalogSynthPatchRepository,
    AnalogSynthPatchLfoRepository,
    AnalogSynthPatchSequencerRepository,
    AnalogSynthPatchEffectsRepository,
    AnalogSynthPatchJsonRepository,
  ],
})
export class BackendDomainAnalogSynthPatchDataAccessModule {}
