import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoModalComponent } from './video-modal';

describe('VideoModalComponent', () => {
  let component: VideoModalComponent;
  let fixture: ComponentFixture<VideoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
