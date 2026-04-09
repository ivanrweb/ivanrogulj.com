import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AnalogSynthPatchRepository,
  AnalogSynthPatchLfoRepository,
  AnalogSynthPatchSequencerRepository,
  AnalogSynthPatchEffectsRepository,
  AnalogSynthPatchEntity,
  AnalogSynthPatchLfoEntity,
  AnalogSynthPatchSequencerEntity,
  AnalogSynthPatchEffectsEntity,
} from '@ivanrogulj.com/backend/domain/analog-synth-patch/data-access';
import { SavePatchDto } from './dto/save-patch.dto';

export interface PatchListItem {
  id: string;
  name: string;
  isPublic: boolean;
  createdAt: Date;
}

export interface FullPatch {
  patch: AnalogSynthPatchEntity;
  lfo1: AnalogSynthPatchLfoEntity | null;
  lfo2: AnalogSynthPatchLfoEntity | null;
  sequencer: AnalogSynthPatchSequencerEntity | null;
  effects: AnalogSynthPatchEffectsEntity | null;
}

@Injectable()
export class AnalogSynthPatchService {
  public constructor(
    private readonly patchRepo: AnalogSynthPatchRepository,
    private readonly lfoRepo: AnalogSynthPatchLfoRepository,
    private readonly sequencerRepo: AnalogSynthPatchSequencerRepository,
    private readonly effectsRepo: AnalogSynthPatchEffectsRepository,
  ) {}

  public async save(userId: string, dto: SavePatchDto): Promise<PatchListItem> {
    const patch = this.patchRepo.create({
      userId,
      name: dto.name,
      isPublic: dto.isPublic,
      oscType: dto.oscType,
      oscillatorCount: dto.oscillatorCount,
      detuneAmount: dto.detuneAmount,
      isPolyphonic: dto.isPolyphonic,
      noiseType: dto.noiseType,
      noiseVolume: dto.noiseVolume,
      masterGain: dto.masterGain,
      filterFrequency: dto.filterFrequency,
      filterResonance: dto.filterResonance,
      filterEnvelopeAmount: dto.filterEnvelopeAmount,
      volAttack: dto.volAttack,
      volDecay: dto.volDecay,
      volSustain: dto.volSustain,
      volRelease: dto.volRelease,
      filterAttack: dto.filterAttack,
      filterDecay: dto.filterDecay,
      filterSustain: dto.filterSustain,
      filterRelease: dto.filterRelease,
    });
    const saved = await this.patchRepo.save(patch);

    await this.lfoRepo.save([
      this.lfoRepo.create({ patchId: saved.id, lfoIndex: 1, ...dto.lfo1 }),
      this.lfoRepo.create({ patchId: saved.id, lfoIndex: 2, ...dto.lfo2 }),
    ]);

    await this.sequencerRepo.save(
      this.sequencerRepo.create({
        patchId: saved.id,
        bpm: dto.bpm,
        rowCount: dto.rowCount,
        steps: dto.steps,
      }),
    );

    await this.effectsRepo.save(
      this.effectsRepo.create({
        patchId: saved.id,
        distortionAmount: dto.distortionAmount,
        distortionTone: dto.distortionTone,
        distortionMix: dto.distortionMix,
        distortionEnabled: dto.distortionEnabled,
        chorusRate: dto.chorusRate,
        chorusDepth: dto.chorusDepth,
        chorusMix: dto.chorusMix,
        chorusEnabled: dto.chorusEnabled,
        reverbMix: dto.reverbMix,
        reverbDecay: dto.reverbDecay,
        reverbEnabled: dto.reverbEnabled,
        delayTime: dto.delayTime,
        delayFeedback: dto.delayFeedback,
        delayMix: dto.delayMix,
        delayEnabled: dto.delayEnabled,
      }),
    );

    return { id: saved.id, name: saved.name, isPublic: saved.isPublic, createdAt: saved.createdAt };
  }

  public async findByUser(userId: string): Promise<PatchListItem[]> {
    const patches = await this.patchRepo.findByUserId(userId);
    return patches.map((p) => ({ id: p.id, name: p.name, isPublic: p.isPublic, createdAt: p.createdAt }));
  }

  public async findPublic(): Promise<PatchListItem[]> {
    const patches = await this.patchRepo.findPublic();
    return patches.map((p) => ({ id: p.id, name: p.name, isPublic: p.isPublic, createdAt: p.createdAt }));
  }

  public async findFullPatch(id: string, userId: string): Promise<FullPatch> {
    const patch = await this.patchRepo.findOne({ where: { id } });
    if (!patch || (patch.userId !== userId && !patch.isPublic)) {
      throw new NotFoundException('Patch not found');
    }
    const lfos = await this.lfoRepo.findByPatchId(id);
    const sequencer = await this.sequencerRepo.findByPatchId(id);
    const effects = await this.effectsRepo.findByPatchId(id);
    return {
      patch,
      lfo1: lfos.find((l) => l.lfoIndex === 1) ?? null,
      lfo2: lfos.find((l) => l.lfoIndex === 2) ?? null,
      sequencer,
      effects,
    };
  }
}
