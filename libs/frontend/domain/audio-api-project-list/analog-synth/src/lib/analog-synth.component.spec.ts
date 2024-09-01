import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalogSynthComponent } from './analog-synth.component';

describe('AnalogSynthComponent', () => {
  let component: AnalogSynthComponent;
  let fixture: ComponentFixture<AnalogSynthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalogSynthComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalogSynthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
