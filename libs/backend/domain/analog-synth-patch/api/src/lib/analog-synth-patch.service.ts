import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  AnalogSynthPatchRepository,
  AnalogSynthPatchLfoRepository,
  AnalogSynthPatchSequencerRepository,
  AnalogSynthPatchEffectsRepository,
  AnalogSynthPatchJsonRepository,
  AnalogSynthPatchEntity,
  AnalogSynthPatchLfoEntity,
  AnalogSynthPatchSequencerEntity,
  AnalogSynthPatchEffectsEntity,
} from '@ivanrogulj.com/backend/domain/analog-synth-patch/data-access';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';
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
    private readonly jsonRepo: AnalogSynthPatchJsonRepository,
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

    await this.jsonRepo.upsertByPatchId(saved.id, this.buildPatchJson(dto));

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

  public async delete(id: string, userId: string): Promise<void> {
    const patch = await this.patchRepo.findOne({ where: { id } });
    if (!patch) throw new NotFoundException('Patch not found');
    if (patch.userId !== userId) throw new ForbiddenException('Not your patch');
    await this.patchRepo.delete(id);
  }

  public async update(id: string, userId: string, dto: SavePatchDto): Promise<PatchListItem> {
    const patch = await this.patchRepo.findOne({ where: { id } });
    if (!patch) throw new NotFoundException('Patch not found');
    if (patch.userId !== userId) throw new ForbiddenException('Not your patch');

    await this.patchRepo.update(id, {
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

    // LFOs: delete all and re-insert (each patch always has exactly 2)
    await this.lfoRepo.delete({ patchId: id });
    await this.lfoRepo.save([
      this.lfoRepo.create({ patchId: id, lfoIndex: 1, ...dto.lfo1 }),
      this.lfoRepo.create({ patchId: id, lfoIndex: 2, ...dto.lfo2 }),
    ]);

    // Sequencer: update in-place to avoid constraint issues
    const existingSeq = await this.sequencerRepo.findByPatchId(id);
    if (existingSeq) {
      await this.sequencerRepo.save({ ...existingSeq, bpm: dto.bpm, rowCount: dto.rowCount, steps: dto.steps });
    } else {
      await this.sequencerRepo.save(
        this.sequencerRepo.create({ patchId: id, bpm: dto.bpm, rowCount: dto.rowCount, steps: dto.steps }),
      );
    }

    // Effects: update in-place to avoid constraint issues
    const existingEffects = await this.effectsRepo.findByPatchId(id);
    const effectsData = {
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
    };
    if (existingEffects) {
      await this.effectsRepo.save({ ...existingEffects, ...effectsData });
    } else {
      await this.effectsRepo.save(this.effectsRepo.create({ patchId: id, ...effectsData }));
    }

    await this.jsonRepo.upsertByPatchId(id, this.buildPatchJson(dto));

    return { id: patch.id, name: dto.name, isPublic: dto.isPublic, createdAt: patch.createdAt };
  }

  private buildPatchJson(dto: SavePatchDto): AnalogSynthApi.FullSynthPatchJson {
    return {
      oscillator: {
        type: dto.oscType,
        count: dto.oscillatorCount,
        detune: dto.detuneAmount,
        isPolyphonic: dto.isPolyphonic,
        noiseType: dto.noiseType,
        noiseVolume: dto.noiseVolume,
      },
      filter: {
        frequency: dto.filterFrequency,
        resonance: dto.filterResonance,
        envelopeAmount: dto.filterEnvelopeAmount,
      },
      volumeEnvelope: {
        attack: dto.volAttack,
        decay: dto.volDecay,
        sustain: dto.volSustain,
        release: dto.volRelease,
      },
      filterEnvelope: {
        attack: dto.filterAttack,
        decay: dto.filterDecay,
        sustain: dto.filterSustain,
        release: dto.filterRelease,
      },
      lfo1: {
        rate: dto.lfo1.rate,
        depth: dto.lfo1.depth,
        waveform: dto.lfo1.waveform,
        destination: dto.lfo1.destination,
        keySync: dto.lfo1.keySync,
        enabled: dto.lfo1.enabled,
      },
      lfo2: {
        rate: dto.lfo2.rate,
        depth: dto.lfo2.depth,
        waveform: dto.lfo2.waveform,
        destination: dto.lfo2.destination,
        keySync: dto.lfo2.keySync,
        enabled: dto.lfo2.enabled,
      },
      effects: {
        distortion: {
          amount: dto.distortionAmount,
          tone: dto.distortionTone,
          mix: dto.distortionMix,
          enabled: dto.distortionEnabled,
        },
        chorus: {
          rate: dto.chorusRate,
          depth: dto.chorusDepth,
          mix: dto.chorusMix,
          enabled: dto.chorusEnabled,
        },
        reverb: {
          mix: dto.reverbMix,
          decay: dto.reverbDecay,
          enabled: dto.reverbEnabled,
        },
        delay: {
          time: dto.delayTime,
          feedback: dto.delayFeedback,
          mix: dto.delayMix,
          enabled: dto.delayEnabled,
        },
      },
      master: {
        gain: dto.masterGain,
      },
      sequencer: {
        bpm: dto.bpm,
        rowCount: Math.max(1, Math.ceil(dto.steps.length / 8)),
        steps: dto.steps,
      },
    };
  }
}
