import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  phosphorGithubLogo,
  phosphorLinkedinLogo,
  phosphorWaveSawtooth,
  phosphorWaveSine,
  phosphorWaveSquare,
  phosphorWaveTriangle,
} from '@ng-icons/phosphor-icons/regular';
import { phosphorGoogleLogoBold } from '@ng-icons/phosphor-icons/bold';

@Component({
  standalone: true,
  imports: [RouterModule],
  providers: [
    provideIcons({
      phosphorWaveSine,
      phosphorWaveSawtooth,
      phosphorWaveSquare,
      phosphorWaveTriangle,
      phosphorGithubLogo,
      phosphorGoogleLogoBold,
      phosphorLinkedinLogo,
    }),
  ],
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {}
