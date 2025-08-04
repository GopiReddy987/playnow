import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Booking {
  id: string;
  userId: string;
  userName: string;
  turfId: string;
  turfName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  specialRequests?: string;
  createdAt: string;
}

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bookings-container">
      <header class="page-header">
        <h1>Booking Management</h1>
        <div class="header-actions">
          <input 
            type="text" 
            placeholder="Search bookings..." 
            [(ngModel)]="searchTerm"
            (input)="filterBookings()"
            class="search-input"
          />
          <select [(ngModel)]="statusFilter" (change)="filterBookings()" class="filter-select">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select [(ngModel)]="paymentFilter" (change)="filterBookings()" class="filter-select">
            <option value="">All Payments</option>
            <option value="pending">Payment Pending</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </header>

      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-number">{{ totalBookings }}</span>
          <span class="stat-label">Total Bookings</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ pendingBookings }}</span>
          <span class="stat-label">Pending</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ todayBookings }}</span>
          <span class="stat-label">Today</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">₹{{ totalRevenue.toLocaleString() }}</span>
          <span class="stat-label">Total Revenue</span>
        </div>
      </div>

      <div class="bookings-table-container">
        <table class="bookings-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Turf</th>
              <th>Date & Time</th>
              <th>Duration</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let booking of filteredBookings" class="booking-row">
              <td class="booking-id">#{{ booking.id }}</td>
              <td class="customer-info">
                <div class="customer-name">{{ booking.userName }}</div>
                <div class="customer-id">ID: {{ booking.userId }}</div>
              </td>
              <td class="turf-info">
                <div class="turf-name">{{ booking.turfName }}</div>
                <div class="turf-id">ID: {{ booking.turfId }}</div>
              </td>
              <td class="datetime-info">
                <div class="date">{{ booking.bookingDate | date:'shortDate' }}</div>
                <div class="time">{{ booking.startTime }} - {{ booking.endTime }}</div>
              </td>
              <td>{{ booking.duration }} hours</td>
              <td class="amount">₹{{ booking.totalAmount.toLocaleString() }}</td>
              <td>
                <span class="status-badge" [class]="'status-' + booking.status">
                  {{ booking.status }}
                </span>
              </td>
              <td>
                <span class="payment-badge" [class]="'payment-' + booking.paymentStatus">
                  {{ booking.paymentStatus }}
                </span>
              </td>
              <td class="actions">
                <button class="btn-action" (click)="viewBooking(booking)">View</button>
                <button 
                  class="btn-action" 
                  *ngIf="booking.status === 'pending'"
                  (click)="confirmBooking(booking)"
                >
                  Confirm
                </button>
                <button 
                  class="btn-action btn-danger" 
                  *ngIf="booking.status === 'pending'"
                  (click)="cancelBooking(booking)"
                >
                  Cancel
                </button>
                <button 
                  class="btn-action" 
                  *ngIf="booking.status === 'confirmed'"
                  (click)="completeBooking(booking)"
                >
                  Complete
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
    .bookings-container {
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
      width: 200px;
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

    .bookings-table-container {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .bookings-table {
      width: 100%;
      border-collapse: collapse;
    }

    .bookings-table th {
      background: #f9fafb;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
    }

    .bookings-table td {
      padding: 1rem;
      border-bottom: 1px solid #f3f4f6;
    }

    .booking-id {
      font-weight: 600;
      color: #3b82f6;
    }

    .customer-name, .turf-name {
      font-weight: 600;
      color: #1f2937;
    }

    .customer-id, .turf-id {
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }

    .date {
      font-weight: 600;
      color: #1f2937;
    }

    .time {
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }

    .amount {
      font-weight: 600;
      color: #059669;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .status-confirmed {
      background: #dbeafe;
      color: #1e40af;
    }

    .status-completed {
      background: #dcfce7;
      color: #166534;
    }

    .status-cancelled {
      background: #fee2e2;
      color: #991b1b;
    }

    .payment-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .payment-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .payment-paid {
      background: #dcfce7;
      color: #166534;
    }

    .payment-refunded {
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
      .bookings-container {
        padding: 1rem;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .header-actions {
        width: 100%;
        flex-wrap: wrap;
      }

      .search-input {
        width: 100%;
      }

      .stats-bar {
        flex-direction: column;
        gap: 1rem;
      }

      .bookings-table {
        font-size: 0.875rem;
      }

      .bookings-table th,
      .bookings-table td {
        padding: 0.5rem;
      }
    }
  `]
})
export class BookingsComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  searchTerm = '';
  statusFilter = '';
  paymentFilter = '';
  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 10;

  // Stats
  totalBookings = 0;
  pendingBookings = 0;
  todayBookings = 0;
  totalRevenue = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    // Mock data - replace with actual API call
    this.bookings = [
      {
        id: 'BK001',
        userId: '1',
        userName: 'John Doe',
        turfId: 'T001',
        turfName: 'Cricket Ground A',
        bookingDate: '2024-07-05',
        startTime: '14:00',
        endTime: '16:00',
        duration: 2,
        totalAmount: 2000,
        status: 'confirmed',
        paymentStatus: 'paid',
        createdAt: '2024-07-01'
      },
      {
        id: 'BK002',
        userId: '2',
        userName: 'Jane Smith',
        turfId: 'T002',
        turfName: 'Football Ground B',
        bookingDate: '2024-07-06',
        startTime: '18:00',
        endTime: '20:00',
        duration: 2,
        totalAmount: 1500,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: '2024-07-02'
      },
      {
        id: 'BK003',
        userId: '3',
        userName: 'Mike Johnson',
        turfId: 'T003',
        turfName: 'Tennis Court C',
        bookingDate: '2024-07-04',
        startTime: '10:00',
        endTime: '12:00',
        duration: 2,
        totalAmount: 1200,
        status: 'completed',
        paymentStatus: 'paid',
        createdAt: '2024-06-30'
      }
    ];

    this.calculateStats();
    this.filterBookings();
  }

  calculateStats() {
    this.totalBookings = this.bookings.length;
    this.pendingBookings = this.bookings.filter(b => b.status === 'pending').length;
    this.totalRevenue = this.bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    
    const today = new Date().toISOString().split('T')[0];
    this.todayBookings = this.bookings.filter(b => b.bookingDate === today).length;
  }

  filterBookings() {
    let filtered = this.bookings;

    if (this.searchTerm) {
      filtered = filtered.filter(booking =>
        booking.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        booking.userName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        booking.turfName.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(booking => booking.status === this.statusFilter);
    }

    if (this.paymentFilter) {
      filtered = filtered.filter(booking => booking.paymentStatus === this.paymentFilter);
    }

    this.filteredBookings = filtered;
    this.totalPages = Math.ceil(this.filteredBookings.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  viewBooking(booking: Booking) {
    console.log('View booking:', booking);
    // Implement booking detail view
  }

  confirmBooking(booking: Booking) {
    booking.status = 'confirmed';
    console.log(`Booking ${booking.id} confirmed`);
    this.calculateStats();
  }

  cancelBooking(booking: Booking) {
    booking.status = 'cancelled';
    console.log(`Booking ${booking.id} cancelled`);
    this.calculateStats();
  }

  completeBooking(booking: Booking) {
    booking.status = 'completed';
    console.log(`Booking ${booking.id} completed`);
    this.calculateStats();
  }
} 