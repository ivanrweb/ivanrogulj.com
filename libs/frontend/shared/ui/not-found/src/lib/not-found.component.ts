import { Component } from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'lib-not-found',
  standalone: true,
  imports: [],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  constructor(private readonly router: Router){}

  public goToDashboard(): void {
    this.router.navigateByUrl('/');
  }
}
