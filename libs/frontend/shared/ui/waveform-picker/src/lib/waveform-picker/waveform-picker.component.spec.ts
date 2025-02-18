import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WaveformPickerComponent } from './waveform-picker.component';

describe('WaveformPickerComponent', () => {
  let component: WaveformPickerComponent;
  let fixture: ComponentFixture<WaveformPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaveformPickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WaveformPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
