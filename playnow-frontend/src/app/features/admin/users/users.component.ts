import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  lastLogin: string;
  status: 'active' | 'inactive' | 'suspended';
  totalBookings: number;
  totalSpent: number;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="users-container">
      <header class="page-header">
        <h1>User Management</h1>
        <div class="header-actions">
          <input 
            type="text" 
            placeholder="Search users..." 
            [(ngModel)]="searchTerm"
            (input)="filterUsers()"
            class="search-input"
          />
          <select [(ngModel)]="statusFilter" (change)="filterUsers()" class="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </header>

      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-number">{{ totalUsers }}</span>
          <span class="stat-label">Total Users</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ activeUsers }}</span>
          <span class="stat-label">Active Users</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ newUsersThisMonth }}</span>
          <span class="stat-label">New This Month</span>
        </div>
      </div>

      <div class="users-table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Contact</th>
              <th>Registration Date</th>
              <th>Last Login</th>
              <th>Status</th>
              <th>Bookings</th>
              <th>Total Spent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of filteredUsers" class="user-row">
              <td class="user-info">
                <div class="user-avatar">{{ user.name.charAt(0) }}</div>
                <div class="user-details">
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-id">ID: {{ user.id }}</div>
                </div>
              </td>
              <td class="contact-info">
                <div>{{ user.email }}</div>
                <div class="phone">{{ user.phone }}</div>
              </td>
              <td>{{ user.registrationDate | date:'short' }}</td>
              <td>{{ user.lastLogin | date:'short' }}</td>
              <td>
                <span class="status-badge" [class]="'status-' + user.status">
                  {{ user.status }}
                </span>
              </td>
              <td>{{ user.totalBookings }}</td>
              <td>₹{{ user.totalSpent.toLocaleString() }}</td>
              <td class="actions">
                <button class="btn-action" (click)="viewUser(user)">View</button>
                <button class="btn-action" (click)="editUser(user)">Edit</button>
                <button 
                  class="btn-action" 
                  [class.btn-danger]="user.status === 'active'"
                  (click)="toggleUserStatus(user)"
                >
                  {{ user.status === 'active' ? 'Suspend' : 'Activate' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <button 
          class="btn-page" 
          [disabled]="currentPage === 1"
          (click)="changePage(currentPage - 1)"
        >
          Previous
        </button>
        <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
        <button 
          class="btn-page" 
          [disabled]="currentPage === totalPages"
          (click)="changePage(currentPage + 1)"
        >
          Next
        </button>
      </div>
    </div>
  `,
  styles: [`
    .users-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e5e7eb;
    }

    .page-header h1 {
      color: #1f2937;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .search-input, .filter-select {
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
    }

    .search-input {
      width: 250px;
    }

    .stats-bar {
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;
      padding: 1rem;
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-number {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }

    .users-table-container {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
    }

    .users-table th {
      background: #f9fafb;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
    }

    .users-table td {
      padding: 1rem;
      border-bottom: 1px solid #f3f4f6;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: #3b82f6;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    .user-name {
      font-weight: 600;
      color: #1f2937;
    }

    .user-id {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .contact-info {
      font-size: 0.875rem;
    }

    .phone {
      color: #6b7280;
      margin-top: 0.25rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-active {
      background: #dcfce7;
      color: #166534;
    }

    .status-inactive {
      background: #fef3c7;
      color: #92400e;
    }

    .status-suspended {
      background: #fee2e2;
      color: #991b1b;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-action {
      padding: 0.25rem 0.75rem;
      border: 1px solid #d1d5db;
      background: white;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-action:hover {
      background: #f9fafb;
    }

    .btn-danger {
      color: #dc2626;
      border-color: #dc2626;
    }

    .btn-danger:hover {
      background: #dc2626;
      color: white;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn-page {
      padding: 0.5rem 1rem;
      border: 1px solid #d1d5db;
      background: white;
      border-radius: 0.375rem;
      cursor: pointer;
    }

    .btn-page:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-page:not(:disabled):hover {
      background: #f9fafb;
    }

    .page-info {
      color: #6b7280;
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .users-container {
        padding: 1rem;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .header-actions {
        width: 100%;
      }

      .search-input {
        width: 100%;
      }

      .stats-bar {
        flex-direction: column;
        gap: 1rem;
      }

      .users-table {
        font-size: 0.875rem;
      }

      .users-table th,
      .users-table td {
        padding: 0.5rem;
      }
    }
  `]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm = '';
  statusFilter = '';
  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 10;

  // Stats
  totalUsers = 0;
  activeUsers = 0;
  newUsersThisMonth = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    // Mock data - replace with actual API call
    this.users = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+91 98765 43210',
        registrationDate: '2024-01-15',
        lastLogin: '2024-07-01',
        status: 'active',
        totalBookings: 12,
        totalSpent: 15000
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+91 98765 43211',
        registrationDate: '2024-02-20',
        lastLogin: '2024-06-28',
        status: 'active',
        totalBookings: 8,
        totalSpent: 12000
      },
      {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        phone: '+91 98765 43212',
        registrationDate: '2024-03-10',
        lastLogin: '2024-06-25',
        status: 'inactive',
        totalBookings: 3,
        totalSpent: 4500
      }
    ];

    this.calculateStats();
    this.filterUsers();
  }

  calculateStats() {
    this.totalUsers = this.users.length;
    this.activeUsers = this.users.filter(u => u.status === 'active').length;
    this.newUsersThisMonth = this.users.filter(u => {
      const regDate = new Date(u.registrationDate);
      const now = new Date();
      return regDate.getMonth() === now.getMonth() && regDate.getFullYear() === now.getFullYear();
    }).length;
  }

  filterUsers() {
    let filtered = this.users;

    if (this.searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.phone.includes(this.searchTerm)
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(user => user.status === this.statusFilter);
    }

    this.filteredUsers = filtered;
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  viewUser(user: User) {
    console.log('View user:', user);
    // Implement user detail view
  }

  editUser(user: User) {
    console.log('Edit user:', user);
    // Implement user edit functionality
  }

  toggleUserStatus(user: User) {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    user.status = newStatus;
    console.log(`User ${user.name} status changed to ${newStatus}`);
    this.calculateStats();
  }
} 