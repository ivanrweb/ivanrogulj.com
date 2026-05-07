import { Component, inject, Input, signal } from '@angular/core';
import { NavItem, NavItemComponent } from '@ivanrogulj.com/nav-item';
import { RouterLink } from '@angular/router';
import { AuthService } from '@ivanrogulj.com/auth';

@Component({
  selector: 'lib-nav',
  standalone: true,
  imports: [NavItemComponent, RouterLink],
  template: `
    <nav>
      <div class="nav-inner">
        <a class="brand" [routerLink]="['/']">
          <img class="prompt" src="svg/terminal.svg" alt="" />
          @if (authService.currentUser()?.firstName) {
          {{ authService.currentUser()!.firstName }}
          {{ authService.currentUser()!.lastName }} } @else { welcome! }
        </a>

        <div class="links" [class.open]="menuOpen()">
          @for (navItem of navItems; track navItem.url) {
          <lib-nav-item
            [item]="navItem"
            (click)="menuOpen.set(false)"
          ></lib-nav-item>
          } @if (authService.currentUser()) {
          <button
            class="login-btn"
            (click)="authService.logout()"
            type="button"
          >
            logout
          </button>
          } @else {
          <a
            class="login-btn"
            [routerLink]="['/login']"
            (click)="menuOpen.set(false)"
            >login</a
          >
          }
        </div>

        <button class="hamburger" (click)="menuOpen.set(!menuOpen())">
          <span [class.top-open]="menuOpen()"></span>
          <span [class.mid-open]="menuOpen()"></span>
          <span [class.bot-open]="menuOpen()"></span>
        </button>
      </div>
    </nav>
  `,
  styles: [
    `
      @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap');

      nav {
        background-color: #0d0e12;
        border-bottom: 1px solid rgba(69, 162, 158, 0.25);
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
        position: sticky;
        top: 0;
        z-index: 100;
        width: 100%;
        box-sizing: border-box;
      }

      .nav-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 60px;
        max-width: 1600px;
        margin: 0 auto;
        padding: 0 2rem;
        box-sizing: border-box;
      }

      .brand {
        font-family: 'Fira Code', monospace;
        font-size: 1rem;
        font-weight: 700;
        color: #c5c6c7;
        text-decoration: none;
        letter-spacing: 1px;
        flex-shrink: 0;
        transition: color 0.2s ease;
      }

      .brand:hover {
        color: #fff;
      }

      .prompt {
        vertical-align: middle;
        margin-right: 0.25rem;
      }

      .links {
        display: flex;
        align-items: center;
        gap: 2.5rem;
      }

      .hamburger {
        display: none;
        flex-direction: column;
        justify-content: center;
        gap: 5px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
      }

      .hamburger span {
        display: block;
        width: 22px;
        height: 2px;
        background-color: #c5c6c7;
        border-radius: 2px;
        transition: transform 0.25s ease, opacity 0.25s ease,
          background-color 0.2s ease;
      }

      .hamburger:hover span {
        background-color: #66fcf1;
      }

      .top-open {
        transform: translateY(7px) rotate(45deg);
      }

      .mid-open {
        opacity: 0;
      }

      .bot-open {
        transform: translateY(-7px) rotate(-45deg);
      }

      @media (max-width: 640px) {
        .hamburger {
          display: flex;
        }

        .links {
          display: none;
          position: absolute;
          top: 61px;
          left: 0;
          right: 0;
          flex-direction: column;
          align-items: flex-start;
          gap: 0;
          background-color: #0d0e12;
          border-bottom: 1px solid rgba(69, 162, 158, 0.25);
          padding: 0.5rem 2rem 1rem;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        }

        .links.open {
          display: flex;
        }

        lib-nav-item {
          width: 100%;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        lib-nav-item:last-child {
          border-bottom: none;
        }

        .login-btn {
          width: 100%;
          padding: 0.75rem 0;
          background: none;
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 0;
          text-align: left;
        }

        .user-email {
          padding: 0.5rem 0;
          display: block;
          color: #888;
          font-family: 'Fira Code', monospace;
          font-size: 0.8rem;
        }
      }

      .login-btn {
        font-family: 'Fira Code', monospace;
        font-size: 0.85rem;
        color: #66fcf1;
        background: rgba(102, 252, 241, 0.08);
        border: 1px solid rgba(102, 252, 241, 0.4);
        border-radius: 4px;
        padding: 0.3rem 0.9rem;
        cursor: pointer;
        text-decoration: none;
        letter-spacing: 0.5px;
        transition: background 0.2s ease, border-color 0.2s ease;
        white-space: nowrap;
      }

      .login-btn:hover {
        background: rgba(102, 252, 241, 0.18);
        border-color: #66fcf1;
      }

      .user-email {
        font-family: 'Fira Code', monospace;
        font-size: 0.8rem;
        color: #888;
        letter-spacing: 0.3px;
        white-space: nowrap;
      }
    `,
  ],
})
export class NavComponent {
  public readonly authService = inject(AuthService);
  protected readonly menuOpen = signal(false);

  @Input()
  public navItems: NavItem[] = [
    { title: 'Dashboard', url: 'dashboard' },
    { title: 'Web Audio Projects', url: 'audio' },
    { title: 'VST Plugins', url: 'juce' },
    { title: 'Articles', url: 'articles' },
    { title: 'Patreon', url: 'patreon' },
  ];
}
