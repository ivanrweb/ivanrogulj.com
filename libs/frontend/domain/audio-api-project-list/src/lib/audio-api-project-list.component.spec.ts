import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AudioApiProjectListComponent } from './audio-api-project-list.component';

describe('AudioApiProjectListComponent', () => {
  let component: AudioApiProjectListComponent;
  let fixture: ComponentFixture<AudioApiProjectListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudioApiProjectListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AudioApiProjectListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
