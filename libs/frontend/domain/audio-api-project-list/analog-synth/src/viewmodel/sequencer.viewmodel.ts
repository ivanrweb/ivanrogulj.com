import { Injectable, OnDestroy, inject } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { AudioContextService } from '../service/audio-context.service';
import { AnalogSynthViewModel } from './analog-synth.viewmodel';
import { MidiService } from '../service/midi.service';

export interface SequencerStep {
  active: boolean;
  note: number;
  velocity: number;
}

export interface SequencerState {
  steps: SequencerStep[];
  bpm: number;
  isPlaying: boolean;
  currentStep: number;
  armedStepIndex: number | null;
  rowCount: number;
}

const MAX_ROWS = 8;
const ROW_SIZE = 8;
const STEP_COUNT = MAX_ROWS * ROW_SIZE;

@Injectable({ providedIn: 'root' })
export class SequencerViewModel
  extends ComponentStore<SequencerState>
  implements OnDestroy
{
  private readonly audioContextService = inject(AudioContextService);
  private readonly analogSynthViewModel = inject(AnalogSynthViewModel);
  private readonly midiService = inject(MidiService);

  private schedulerIntervalId: ReturnType<typeof setInterval> | null = null;
  private nextStepTime = 0;
  private readonly scheduleAheadTime = 0.1;
  private readonly schedulerIntervalMs = 25;
  private currentStepIndex = 0;

  public readonly vm$ = this.select((s) => s);

  public getState(): SequencerState {
    return this.get();
  }

  constructor() {
    super({
      steps: Array.from({ length: STEP_COUNT }, () => ({
        active: false,
        note: 60,
        velocity: 100,
      })),
      bpm: 120,
      isPlaying: false,
      currentStep: -1,
      armedStepIndex: null,
      rowCount: 2,
    });

    this.midiService.noteOn$.subscribe(({ note, velocity }) => {
      const { armedStepIndex } = this.get();
      if (armedStepIndex !== null) {
        this.patchState((state) => ({
          steps: state.steps.map((step, i) =>
            i === armedStepIndex
              ? { ...step, note, velocity, active: true }
              : step
          ),
          armedStepIndex: null,
        }));
      }
    });
  }

  public readonly toggleStep = this.updater((state, index: number) => ({
    ...state,
    steps: state.steps.map((step, i) =>
      i === index ? { ...step, active: !step.active } : step
    ),
  }));

  public readonly armStep = this.updater((state, index: number) => ({
    ...state,
    armedStepIndex: state.armedStepIndex === index ? null : index,
  }));

  public readonly disarm = this.updater((state) => ({
    ...state,
    armedStepIndex: null,
  }));

  public readonly setStepData = this.updater(
    (
      state,
      payload: {
        index: number;
        note?: number;
        velocity?: number;
        active?: boolean;
      }
    ) => ({
      ...state,
      steps: state.steps.map((step, i) =>
        i === payload.index
          ? {
              active: payload.active ?? step.active,
              note: payload.note ?? step.note,
              velocity: payload.velocity ?? step.velocity,
            }
          : step
      ),
    })
  );

  public readonly addRow = this.updater((state) => ({
    ...state,
    rowCount: Math.min(MAX_ROWS, state.rowCount + 1),
  }));

  public readonly setBpm = this.updater((state, bpm: number) => ({
    ...state,
    bpm: Math.max(10, Math.min(999, bpm)),
  }));

  private readonly setCurrentStep = this.updater(
    (state, currentStep: number) => ({ ...state, currentStep })
  );

  public start(): void {
    const ctx = this.audioContextService.getAudioContext();
    this.nextStepTime = ctx.currentTime;
    this.currentStepIndex = 0;
    this.patchState({ isPlaying: true });
    this.schedulerIntervalId = setInterval(
      () => this.runScheduler(),
      this.schedulerIntervalMs
    );
  }

  public stop(): void {
    if (this.schedulerIntervalId !== null) {
      clearInterval(this.schedulerIntervalId);
      this.schedulerIntervalId = null;
    }
    this.patchState({ isPlaying: false, currentStep: -1 });
  }

  public togglePlayStop(): void {
    if (this.get().isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  /**
   * After completing a row, check if any steps in subsequent rows are active.
   * If not, loop back to step 0 immediately.
   */
  private getNextStepIndex(current: number): number {
    const { rowCount, steps } = this.get();
    const effectiveCount = rowCount * ROW_SIZE;
    const next = current + 1;

    if (next >= effectiveCount) return 0;

    // End of a row — check if remaining rows have any active steps
    if (next % ROW_SIZE === 0) {
      const hasActiveInRemainingRows = steps
        .slice(next, effectiveCount)
        .some((s) => s.active);
      if (!hasActiveInRemainingRows) return 0;
    }

    return next;
  }

  private runScheduler(): void {
    const ctx = this.audioContextService.getAudioContext();
    const { bpm } = this.get();
    const secondsPerStep = (60.0 / bpm) * 0.25;

    while (this.nextStepTime < ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleStep(
        this.currentStepIndex,
        this.nextStepTime,
        secondsPerStep,
        ctx.currentTime
      );
      this.currentStepIndex = this.getNextStepIndex(this.currentStepIndex);
      this.nextStepTime += secondsPerStep;
    }
  }

  private scheduleStep(
    stepIndex: number,
    stepTime: number,
    stepDuration: number,
    now: number
  ): void {
    const { steps } = this.get();
    const step = steps[stepIndex];
    const delayMs = Math.max(0, (stepTime - now) * 1000);

    setTimeout(() => {
      if (this.get().isPlaying) {
        this.setCurrentStep(stepIndex);
      }
    }, delayMs);

    if (step.active) {
      const { note, velocity } = step;
      const noteOffDelayMs = delayMs + stepDuration * 0.75 * 1000;

      setTimeout(() => {
        if (this.get().isPlaying) {
          this.analogSynthViewModel.triggerNoteOn(note, velocity);
        }
      }, delayMs);

      setTimeout(() => {
        this.analogSynthViewModel.triggerNoteOff(note);
      }, noteOffDelayMs);
    }
  }

  public override ngOnDestroy(): void {
    this.stop();
    super.ngOnDestroy();
  }
}
