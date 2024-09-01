import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModularSynthComponent } from './modular-synth.component';

describe('ModularSynthComponent', () => {
  let component: ModularSynthComponent;
  let fixture: ComponentFixture<ModularSynthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModularSynthComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModularSynthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
