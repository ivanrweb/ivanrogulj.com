import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  phosphorWaveSawtooth,
  phosphorWaveSine,
  phosphorWaveSquare,
  phosphorWaveTriangle,
} from '@ng-icons/phosphor-icons/regular';

@Component({
  standalone: true,
  imports: [RouterModule],
  providers: [
    provideIcons({
      phosphorWaveSine,
      phosphorWaveSawtooth,
      phosphorWaveSquare,
      phosphorWaveTriangle,
    }),
  ],
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {}
