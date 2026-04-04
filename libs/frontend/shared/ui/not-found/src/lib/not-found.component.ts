import { Component } from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'lib-not-found',
  standalone: true,
  imports: [],
  template: `
    <p>Page not found</p>
    <button (click)="goToDashboard()">Return to dashboard</button>
  `,
})
export class NotFoundComponent {
  constructor(private readonly router: Router) {}

  public goToDashboard(): void {
    this.router.navigateByUrl('/');
  }
}
