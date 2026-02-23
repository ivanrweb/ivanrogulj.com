import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChordChangerComponent } from './chord-changer.component';

describe('ChordChangerComponent', () => {
  let component: ChordChangerComponent;
  let fixture: ComponentFixture<ChordChangerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChordChangerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChordChangerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
