import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { SourceModuleComponent } from './source-module.component';
import { AudioContextService } from '../service/audio-context.service';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { FilterComponent } from '@ivanrogulj.com/filter';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { GainComponent } from '@ivanrogulj.com/gain';
import { AnalogSynthViewModel } from '../viewmodel/analog-synth.viewmodel';
import { FormsModule } from '@angular/forms';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { OscilloscopeComponent } from '@ivanrogulj.com/oscilloscope';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { TextareaComponent } from '@ivanrogulj.com/textarea';
import { AnalogSynthApi } from '@ivanrogulj.com/shared/data-access/model';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { EffectsRackComponent } from '@ivanrogulj.com/effects-rack';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { NoiseGeneratorComponent } from '@ivanrogulj.com/noise';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { LfoRackComponent } from '@ivanrogulj.com/lfo-unit';
import { MidiService } from '../service/midi.service';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AuthService } from '@ivanrogulj.com/auth';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PatchApiService, PatchSummary } from '../service/patch-api.service';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { DialogComponent } from '@ivanrogulj.com/dialog';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  ActionDropdownComponent,
  ActionDropdownItem,
  ActionDropdownSection,
} from '@ivanrogulj.com/action-dropdown';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ButtonDirective } from '@ivanrogulj.com/button';

@Component({
  selector: 'lib-analog-synth',
  standalone: true,
  imports: [
    CommonModule,
    SourceModuleComponent,
    FilterComponent,
    GainComponent,
    FormsModule,
    OscilloscopeComponent,
    TextareaComponent,
    EffectsRackComponent,
    NoiseGeneratorComponent,
    LfoRackComponent,
    KeyValuePipe,
    DialogComponent,
    ActionDropdownComponent,
    ButtonDirective,
  ],
  providers: [AudioContextService],
  templateUrl: './analog-synth.component.html',
  styleUrl: './analog-synth.component.scss',
})
export class AnalogSynthComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('oscilloscope', { static: false })
  public oscilloscopeCanvas!: ElementRef<HTMLCanvasElement>;

  public analogSynthViewModel = inject(AnalogSynthViewModel);
  public midiService = inject(MidiService);
  public authService = inject(AuthService);
  private readonly patchApiService = inject(PatchApiService);
  private readonly router = inject(Router);

  public readonly oscillatorCount = [1, 2, 3, 4, 5, 6, 7, 8];

  public showMidiMapper = false;
  public showMidiDropdown = false;
  public showSaveDialog = false;
  public showEditDialog = false;
  public showDeleteDialog = false;
  public newPresetName = '';
  public newPresetIsPublic = false;
  public myPresets = signal<PatchSummary[]>([]);
  public publicPresets = signal<PatchSummary[]>([]);
  public selectedPresetId = '';
  public selectedPresetName = '';
  public selectedPresetIsPublic = false;
  public pendingDeleteId = '';
  public pendingDeleteName = '';

  public presetSections = computed<ActionDropdownSection[]>(() => [
    {
      label: 'my presets',
      items: this.myPresets().map((p) => ({ id: p.id, name: p.name })),
      deletable: true,
    },
    {
      label: 'community',
      items: this.publicPresets().map((p) => ({ id: p.id, name: p.name })),
      deletable: false,
    },
  ]);

  @HostListener('document:keydown', ['$event'])
  public onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'm' && event.key !== 'M') return;
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) return;
    this.analogSynthViewModel.toggleMidiLearn();
  }

  protected readonly knobLabels: Record<AnalogSynthApi.Knob, string> = {
    [AnalogSynthApi.Knob.ATTACK]: 'Amp Attack',
    [AnalogSynthApi.Knob.DECAY]: 'Amp Decay',
    [AnalogSynthApi.Knob.SUSTAIN]: 'Amp Sustain',
    [AnalogSynthApi.Knob.RELEASE]: 'Amp Release',
    [AnalogSynthApi.Knob.FILTER_ATTACK]: 'Filter Attack',
    [AnalogSynthApi.Knob.FILTER_DECAY]: 'Filter Decay',
    [AnalogSynthApi.Knob.FILTER_SUSTAIN]: 'Filter Sustain',
    [AnalogSynthApi.Knob.FILTER_RELEASE]: 'Filter Release',
    [AnalogSynthApi.Knob.OSCILLATOR_COUNT]: 'Oscillator Count',
    [AnalogSynthApi.Knob.DETUNE_OSCILLATORS_AMOUNT]: 'Detune',
    [AnalogSynthApi.Knob.MASTER_GAIN]: 'Master Volume',
    [AnalogSynthApi.Knob.FILTER_FREQUENCY]: 'Filter Cutoff',
    [AnalogSynthApi.Knob.FILTER_RESONANCE]: 'Filter Resonance',
    [AnalogSynthApi.Knob.FILTER_ENVELOPE_AMOUNT]: 'Filter Env Amt',
    [AnalogSynthApi.Knob.DISTORTION_AMOUNT]: 'Distortion Amount',
    [AnalogSynthApi.Knob.DISTORTION_TONE]: 'Distortion Tone',
    [AnalogSynthApi.Knob.DISTORTION_MIX]: 'Distortion Mix',
    [AnalogSynthApi.Knob.REVERB_MIX]: 'Reverb Mix',
    [AnalogSynthApi.Knob.REVERB_DECAY]: 'Reverb Decay',
    [AnalogSynthApi.Knob.DELAY_TIME]: 'Delay Time',
    [AnalogSynthApi.Knob.DELAY_FEEDBACK]: 'Delay Feedback',
    [AnalogSynthApi.Knob.DELAY_MIX]: 'Delay Mix',
    [AnalogSynthApi.Knob.CHORUS_RATE]: 'Chorus Rate',
    [AnalogSynthApi.Knob.CHORUS_DEPTH]: 'Chorus Depth',
    [AnalogSynthApi.Knob.CHORUS_MIX]: 'Chorus Mix',
    [AnalogSynthApi.Knob.LFO1_RATE]: 'LFO 1 Rate',
    [AnalogSynthApi.Knob.LFO1_DEPTH]: 'LFO 1 Depth',
    [AnalogSynthApi.Knob.LFO2_RATE]: 'LFO 2 Rate',
    [AnalogSynthApi.Knob.LFO2_DEPTH]: 'LFO 2 Depth',
  };

  public ngOnInit(): void {
    this.analogSynthViewModel.startAudioContext();
    if (this.authService.currentUser()) {
      forkJoin({
        mine: this.patchApiService.getMyPresets(),
        pub: this.patchApiService.getPublicPresets(),
      }).subscribe(({ mine, pub }) => {
        this.myPresets.set(mine);
        const myIds = new Set(mine.map((p) => p.id));
        this.publicPresets.set(pub.filter((p) => !myIds.has(p.id)));
      });
    } else {
      this.patchApiService.getPublicPresets().subscribe((presets) => {
        this.publicPresets.set(presets);
      });
    }
  }

  public ngAfterViewInit(): void {
    if (this.oscilloscopeCanvas) {
      this.analogSynthViewModel.initializeOscilloscope(this.oscilloscopeCanvas);
    }
  }

  public ngOnDestroy(): void {
    this.analogSynthViewModel.destroyAudioContext();
  }

  protected readonly AnalogSynthApi = AnalogSynthApi;

  public onSaveButtonClick(): void {
    if (!this.authService.currentUser()) {
      this.router.navigate(['/login']);
      return;
    }
    this.showSaveDialog = true;
  }

  public onSavePreset(): void {
    if (!this.newPresetName.trim()) return;
    const name = this.newPresetName.trim();
    const isPublic = this.newPresetIsPublic;
    this.patchApiService.savePreset(name, isPublic).subscribe((result) => {
      this.myPresets.update((list) => [
        ...list,
        {
          id: result.id,
          name: result.name,
          isPublic,
          createdAt: new Date().toISOString(),
        },
      ]);
      this.selectedPresetId = result.id;
      this.selectedPresetName = result.name;
      this.selectedPresetIsPublic = isPublic;
      this.showSaveDialog = false;
      this.newPresetName = '';
      this.newPresetIsPublic = false;
    });
  }

  public onPresetSelected(item: ActionDropdownItem): void {
    const preset = this.myPresets().find((p) => p.id === item.id) ?? this.publicPresets().find((p) => p.id === item.id);
    this.selectedPresetId = item.id;
    this.selectedPresetName = item.name;
    this.selectedPresetIsPublic = preset?.isPublic ?? false;
    this.patchApiService.loadPreset(item.id).subscribe();
  }

  public onPresetDeleted(id: string): void {
    const preset = this.myPresets().find((p) => p.id === id);
    this.pendingDeleteId = id;
    this.pendingDeleteName = preset?.name ?? '';
    this.showDeleteDialog = true;
  }

  public onDeletePreset(): void {
    this.showDeleteDialog = false;
    this.patchApiService.deletePreset(this.pendingDeleteId).subscribe(() => {
      this.myPresets.update((list) =>
        list.filter((p) => p.id !== this.pendingDeleteId)
      );
      if (this.selectedPresetId === this.pendingDeleteId) {
        this.selectedPresetId = '';
        this.selectedPresetName = '';
        this.selectedPresetIsPublic = false;
      }
      this.pendingDeleteId = '';
      this.pendingDeleteName = '';
    });
  }

  public onUpdatePreset(): void {
    this.showEditDialog = false;
    this.patchApiService
      .updatePreset(
        this.selectedPresetId,
        this.selectedPresetName,
        this.selectedPresetIsPublic
      )
      .subscribe({
        next: () =>
          console.log(
            '[Preset] Updated successfully:',
            this.selectedPresetName
          ),
        error: (err) => console.error('[Preset] Update failed:', err),
      });
  }

  public getKnobLabel(key: string): string {
    return this.knobLabels[key as AnalogSynthApi.Knob] ?? key;
  }
}
