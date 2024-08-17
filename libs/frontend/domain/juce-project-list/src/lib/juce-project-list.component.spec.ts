import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JuceProjectListComponent } from './juce-project-list.component';

describe('JuceProjectListComponent', () => {
  let component: JuceProjectListComponent;
  let fixture: ComponentFixture<JuceProjectListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JuceProjectListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JuceProjectListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
