import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScrollableComponent } from './scrollable.component';

describe('ScrollableComponent', () => {
  let component: ScrollableComponent;
  let fixture: ComponentFixture<ScrollableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrollableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScrollableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('scrolls vertically by default and hides the horizontal overflow', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.style.overflowY).toBe('auto');
    expect(host.style.overflowX).toBe('hidden');
  });

  it('scrolls both ways when axis is "both"', () => {
    fixture.componentRef.setInput('axis', 'both');
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.style.overflowY).toBe('auto');
    expect(host.style.overflowX).toBe('auto');
  });
});
