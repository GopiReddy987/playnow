import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeMatches: number;
  totalTurfs: number;
  pendingBookings: number;
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'registration' | 'match' | 'payment';
  description: string;
  timestamp: string;
  user: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-dashboard">
      <header class="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div class="header-actions">
          <button class="btn-secondary" (click)="refreshData()">Refresh</button>
          <span class="last-updated">Last updated: {{ lastUpdated | date:'short' }}</span>
        </div>
      </header>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>{{ stats.totalUsers }}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <h3>{{ stats.totalBookings }}</h3>
            <p>Total Bookings</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <h3>₹{{ stats.totalRevenue.toLocaleString() }}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⚽</div>
          <div class="stat-content">
            <h3>{{ stats.activeMatches }}</h3>
            <p>Active Matches</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏟️</div>
          <div class="stat-content">
            <h3>{{ stats.totalTurfs }}</h3>
            <p>Total Turfs</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <h3>{{ stats.pendingBookings }}</h3>
            <p>Pending Bookings</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <a routerLink="/admin/ground-management" class="action-card">
            <div class="action-icon">🏟️</div>
            <h3>Manage Grounds</h3>
            <p>Add, edit, or remove sports grounds</p>
          </a>
          <a routerLink="/admin/users" class="action-card">
            <div class="action-icon">👥</div>
            <h3>Manage Users</h3>
            <p>View and manage user accounts</p>
          </a>
          <a routerLink="/admin/bookings" class="action-card">
            <div class="action-icon">📅</div>
            <h3>View Bookings</h3>
            <p>Monitor all booking activities</p>
          </a>
          <a routerLink="/admin/matches" class="action-card">
            <div class="action-icon">⚽</div>
            <h3>Manage Matches</h3>
            <p>Oversee match activities</p>
          </a>
          <a routerLink="/admin/reports" class="action-card">
            <div class="action-icon">📊</div>
            <h3>Reports</h3>
            <p>Generate business reports</p>
          </a>
          <a routerLink="/admin/settings" class="action-card">
            <div class="action-icon">⚙️</div>
            <h3>Settings</h3>
            <p>Configure system settings</p>
          </a>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="recent-activity">
        <h2>Recent Activity</h2>
        <div class="activity-list">
          <div *ngFor="let activity of recentActivities" class="activity-item">
            <div class="activity-icon" [class]="'icon-' + activity.type">
              {{ getActivityIcon(activity.type) }}
            </div>
            <div class="activity-content">
              <p class="activity-description">{{ activity.description }}</p>
              <p class="activity-meta">{{ activity.user }} • {{ activity.timestamp | date:'short' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e5e7eb;
    }

    .dashboard-header h1 {
      color: #1f2937;
      margin: 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .btn-secondary:hover {
      background: #4b5563;
    }

    .last-updated {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      border-left: 4px solid #3b82f6;
    }

    .stat-icon {
      font-size: 2rem;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #eff6ff;
      border-radius: 0.5rem;
    }

    .stat-content h3 {
      margin: 0;
      font-size: 1.875rem;
      font-weight: 700;
      color: #1f2937;
    }

    .stat-content p {
      margin: 0.25rem 0 0 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .quick-actions {
      margin-bottom: 3rem;
    }

    .quick-actions h2 {
      color: #1f2937;
      margin-bottom: 1.5rem;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .action-card {
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s, box-shadow 0.2s;
      border: 1px solid #e5e7eb;
    }

    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .action-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .action-card h3 {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
      font-size: 1.25rem;
    }

    .action-card p {
      margin: 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .recent-activity {
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .recent-activity h2 {
      color: #1f2937;
      margin-bottom: 1.5rem;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      border-radius: 0.5rem;
      background: #f9fafb;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.5rem;
      font-size: 1.25rem;
    }

    .icon-booking { background: #dbeafe; }
    .icon-registration { background: #dcfce7; }
    .icon-match { background: #fef3c7; }
    .icon-payment { background: #fce7f3; }

    .activity-content {
      flex: 1;
    }

    .activity-description {
      margin: 0 0 0.25rem 0;
      color: #1f2937;
      font-weight: 500;
    }

    .activity-meta {
      margin: 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .admin-dashboard {
        padding: 1rem;
      }

      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeMatches: 0,
    totalTurfs: 0,
    pendingBookings: 0
  };

  recentActivities: RecentActivity[] = [];
  lastUpdated = new Date();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Load stats
    this.loadStats();
    
    // Load recent activities
    this.loadRecentActivities();
    
    this.lastUpdated = new Date();
  }

  loadStats() {
    // Mock data for now - replace with actual API calls
    this.stats = {
      totalUsers: 1250,
      totalBookings: 3420,
      totalRevenue: 1250000,
      activeMatches: 15,
      totalTurfs: 8,
      pendingBookings: 23
    };
  }

  loadRecentActivities() {
    // Mock data for now - replace with actual API calls
    this.recentActivities = [
      {
        id: '1',
        type: 'booking',
        description: 'New booking for Cricket Ground - 2 hours',
        timestamp: new Date().toISOString(),
        user: 'John Doe'
      },
      {
        id: '2',
        type: 'registration',
        description: 'New user registered: jane@example.com',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        user: 'Jane Smith'
      },
      {
        id: '3',
        type: 'match',
        description: 'Football match created: Weekend League',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        user: 'Mike Johnson'
      },
      {
        id: '4',
        type: 'payment',
        description: 'Payment received: ₹2000 for Tennis Court',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        user: 'Sarah Wilson'
      }
    ];
  }

  refreshData() {
    this.loadDashboardData();
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      booking: '📅',
      registration: '👤',
      match: '⚽',
      payment: '💰'
    };
    return icons[type] || '📋';
  }
} 