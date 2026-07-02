import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthTooltipComponent } from './auth-tooltip.component';

describe('AuthTooltipComponent', () => {
  let component: AuthTooltipComponent;
  let fixture: ComponentFixture<AuthTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthTooltipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
