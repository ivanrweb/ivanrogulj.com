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
      .dashboard {
        min-height: 100vh;
        background: #1a1a2e;
        color: #e2e8f0;
      }
      .header {
        background: #16213e;
        padding: 1.25rem 2rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #334155;
        h1 {
          margin: 0;
          font-size: 1.25rem;
          color: #e2e8f0;
        }
      }
      .logout-btn {
        padding: 0.5rem 1rem;
        background: transparent;
        border: 1px solid #475569;
        color: #94a3b8;
        border-radius: 6px;
        cursor: pointer;
        &:hover {
          background: #334155;
          color: #e2e8f0;
        }
      }
      .content {
        padding: 2rem;
        max-width: 900px;
        margin: 0 auto;
      }
      .panel {
        background: #16213e;
        border-radius: 12px;
        padding: 2rem;
        border: 1px solid #334155;
        h2 {
          color: #e2e8f0;
          margin: 0 0 0.75rem;
        }
        p {
          color: #94a3b8;
          margin: 0 0 1.5rem;
        }
      }
      .actions {
        display: flex;
        gap: 1rem;
      }
      .btn {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-size: 0.9rem;
        text-decoration: none;
        cursor: pointer;
      }
      .btn-primary {
        background: #6366f1;
        color: white;
        &:hover {
          background: #4f46e5;
        }
      }
      .btn-secondary {
        background: #334155;
        color: #e2e8f0;
        &:hover {
          background: #475569;
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
