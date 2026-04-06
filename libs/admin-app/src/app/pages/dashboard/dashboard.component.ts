import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="dashboard">
      <header class="header">
        <h1>Admin Dashboard</h1>
        <button class="logout-btn" (click)="logout()">Logout</button>
      </header>
      <main class="content">
        <div class="panel">
          <h2>Blog Management</h2>
          <p>Create, edit, and manage your blog articles.</p>
          <div class="actions">
            <a routerLink="/articles" class="btn btn-secondary">View All Articles</a>
            <a routerLink="/articles/new" class="btn btn-primary">Create New Article</a>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&family=Inter:wght@300;400;600&display=swap');

      .dashboard {
        min-height: 100vh;
        background: #0b0c10;
        color: #c5c6c7;
        font-family: 'Inter', sans-serif;
      }
      .header {
        background: #1f2833;
        padding: 1.25rem 2rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #333;
        h1 {
          margin: 0;
          font-family: 'Fira Code', monospace;
          font-size: 1.25rem;
          color: #66fcf1;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
      }
      .logout-btn {
        padding: 0.5rem 1rem;
        background: transparent;
        border: 1px solid #333;
        color: #888;
        border-radius: 4px;
        font-family: 'Fira Code', monospace;
        font-size: 0.8rem;
        cursor: pointer;
        text-transform: uppercase;
        letter-spacing: 1px;
        transition: all 0.2s;
        &:hover {
          border-color: #ff007f;
          color: #ff007f;
        }
      }
      .content {
        padding: 2rem;
        max-width: 900px;
      }
      .panel {
        background: #1f2833;
        border-radius: 8px;
        padding: 2rem;
        border: 1px solid #333;
        h2 {
          font-family: 'Fira Code', monospace;
          color: #66fcf1;
          margin: 0 0 0.75rem;
          font-size: 1.1rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        p {
          color: #888;
          margin: 0 0 1.5rem;
        }
      }
      .actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .btn {
        display: inline-block;
        padding: 0.625rem 1.25rem;
        border-radius: 4px;
        font-family: 'Fira Code', monospace;
        font-size: 0.85rem;
        text-decoration: none;
        cursor: pointer;
        text-transform: uppercase;
        letter-spacing: 1px;
        transition: all 0.2s;
      }
      .btn-primary {
        background: rgba(255, 0, 127, 0.1);
        color: #ff007f;
        border: 1px solid #ff007f;
        &:hover {
          background: rgba(255, 0, 127, 0.2);
        }
      }
      .btn-secondary {
        background: rgba(102, 252, 241, 0.05);
        color: #45a29e;
        border: 1px solid #333;
        &:hover {
          border-color: #45a29e;
          color: #66fcf1;
        }
      }
    `,
  ],
})
export class DashboardComponent {
  public logout(): void {
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  }
}
