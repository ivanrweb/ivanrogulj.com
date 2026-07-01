import { Component, input } from '@angular/core';

@Component({
  selector: 'lib-avatar',
  standalone: true,
  template: `
    <div class="avatar" [style.width.px]="size()" [style.height.px]="size()">
      @if (src()) {
      <img [src]="src()" [alt]="alt()" />
      } @else {
      <div class="placeholder">{{ initials() }}</div>
      }
    </div>
  `,
  styles: [
    `
      .avatar {
        border-radius: 5%;
        overflow: hidden;
        box-shadow: 0 0 0 1px rgba(102, 252, 241, 0.1),
          0 4px 16px rgba(0, 0, 0, 0.5);
        flex-shrink: 0;
      }

      .avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .placeholder {
        width: 100%;
        height: 100%;
        background: #1f2833;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #66fcf1;
        font-family: 'Fira Code', monospace;
        font-weight: 700;
        font-size: 1.4rem;
      }
    `,
  ],
})
export class AvatarComponent {
  public src = input<string>('');
  public alt = input<string>('Avatar');
  public size = input<number>(80);
  public initials = input<string>('IR');
}
