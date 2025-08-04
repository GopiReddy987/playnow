import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
import { MatchService } from '../../core/services/match.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  user: any = null;
  isLoading = false;
  error: string | null = null;

  // Dashboard stats
  totalBookings = 0;
  confirmedBookings = 0;
  totalRevenue = 0;
  upcomingMatches = 0;
  activeRequests = 0;

  // Recent activity
  recentBookings: any[] = [];
  recentMatches: any[] = [];

  private subscription = new Subscription();

  constructor(
    private router: Router,
    private authService: AuthService,
    private bookingService: BookingService,
    private matchService: MatchService
  ) {}

  get isAdmin(): boolean {
    return this.authService.hasRole('Admin');
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadDashboardData() {
    this.isLoading = true;
    this.error = null;

    // Get current user
    this.user = this.authService.getUser();

    // Load bookings data
    this.subscription.add(
      this.bookingService.loadUserBookings().subscribe({
        next: (bookings) => {
          this.totalBookings = bookings ? bookings.length : 0;
          this.confirmedBookings = bookings ? bookings.filter(b => b.status === 'confirmed').length : 0;
          this.totalRevenue = bookings
            ? bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.totalAmount, 0)
            : 0;
          
          // Get recent bookings (last 5)
          this.recentBookings = bookings
            ? bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
            : [];
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading bookings:', error);
          this.error = 'Failed to load booking data.';
          this.isLoading = false;
        }
      })
    );

    // Load matches data
    this.subscription.add(
      this.matchService.loadMatches().subscribe({
        next: () => {
          const matches = this.matchService.allMatches();
          this.upcomingMatches = matches ? matches.filter(m => 
            new Date(m.date) > new Date() && m.status === 'Open'
          ).length : 0;
          
          // Get recent matches (last 5)
          this.recentMatches = matches
            ? matches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
            : [];
        },
        error: (error) => {
          console.error('Error loading matches:', error);
        }
      })
    );

    // Load player requests
    // Commented out: this.matchService.loadPlayerRequests().subscribe({
    //   next: (requests) => { /* handle requests */ },
    //   error: (err) => { /* handle error */ }
    // });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    return timeString;
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'green';
      case 'pending':
        return 'orange';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  }

  retryLoad() {
    this.loadDashboardData();
  }
} 