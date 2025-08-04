import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  // Using Angular 17 Signals for reactive state management
  title = signal('Welcome to PlayNow');
  subtitle = signal('Book your favorite turf and play with friends!');
  
  features = signal([
    {
      title: 'Easy Booking',
      description: 'Book your preferred turf with just a few clicks. No hassle, no waiting!'
    },
    {
      title: 'Premium Turfs',
      description: 'Access to the best quality turfs with professional maintenance.'
    },
    {
      title: 'Real-time Availability',
      description: 'Check real-time availability and book instantly.'
    },
    {
      title: 'Team Management',
      description: 'Create teams, manage players, and organize tournaments.'
    }
  ]);

  stats = signal({
    totalBookings: 15420,
    activeTurfs: 25,
    happyPlayers: 8500
  });

  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  bookNow() {
    console.log('Navigate to sports selection page');
    this.router.navigate(['/sports']);
  }

  viewTurfs() {
    console.log('Navigate to turfs page');
    this.router.navigate(['/turf']);
  }

  joinGame() {
    this.router.navigate(['/join-game']);
  }
} 