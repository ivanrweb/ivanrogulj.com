import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class LfoDto {
  @IsNumber()
  public rate!: number;

  @IsNumber()
  public depth!: number;

  @IsString()
  public waveform!: string;

  @IsString()
  public destination!: string;

  @IsBoolean()
  public keySync!: boolean;

  @IsBoolean()
  public enabled!: boolean;
}

export class SequencerStepDto {
  @IsBoolean()
  public active!: boolean;

  @IsNumber()
  public note!: number;

  @IsNumber()
  public velocity!: number;
}

export class SavePatchDto {
  @IsString()
  public name!: string;

  @IsBoolean()
  public isPublic!: boolean;

  // Source mode
  @IsOptional()
  @IsString()
  public sourceMode?: string;

  @IsOptional()
  @IsString()
  public samplerPreset?: string | null;

  // Main patch
  @IsString()
  public oscType!: string;

  @IsNumber()
  public oscillatorCount!: number;

  @IsNumber()
  public detuneAmount!: number;

  @IsBoolean()
  public isPolyphonic!: boolean;

  @IsString()
  public noiseType!: string;

  @IsNumber()
  public noiseVolume!: number;

  @IsNumber()
  public masterGain!: number;

  @IsNumber()
  public filterFrequency!: number;

  @IsNumber()
  public filterResonance!: number;

  @IsNumber()
  public filterEnvelopeAmount!: number;

  @IsNumber()
  public volAttack!: number;

  @IsNumber()
  public volDecay!: number;

  @IsNumber()
  public volSustain!: number;

  @IsNumber()
  public volRelease!: number;

  @IsNumber()
  public filterAttack!: number;

  @IsNumber()
  public filterDecay!: number;

  @IsNumber()
  public filterSustain!: number;

  @IsNumber()
  public filterRelease!: number;

  // LFOs
  @ValidateNested()
  @Type(() => LfoDto)
  public lfo1!: LfoDto;

  @ValidateNested()
  @Type(() => LfoDto)
  public lfo2!: LfoDto;

  // Sequencer
  @IsNumber()
  public bpm!: number;

  @IsNumber()
  public rowCount!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SequencerStepDto)
  public steps!: SequencerStepDto[];

  // Effects
  @IsNumber()
  public distortionAmount!: number;

  @IsNumber()
  public distortionTone!: number;

  @IsNumber()
  public distortionMix!: number;

  @IsBoolean()
  public distortionEnabled!: boolean;

  @IsNumber()
  public chorusRate!: number;

  @IsNumber()
  public chorusDepth!: number;

  @IsNumber()
  public chorusMix!: number;

  @IsBoolean()
  public chorusEnabled!: boolean;

  @IsNumber()
  public reverbMix!: number;

  @IsNumber()
  public reverbDecay!: number;

  @IsBoolean()
  public reverbEnabled!: boolean;

  @IsNumber()
  public delayTime!: number;

  @IsNumber()
  public delayFeedback!: number;

  @IsNumber()
  public delayMix!: number;

  @IsBoolean()
  public delayEnabled!: boolean;
}
