import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WhatsAppService, BookingNotification } from '../../core/services/whatsapp.service';

interface BookingForm {
  playerName: string;
  turfId: string;
  date: string;
  timeSlot: string;
  duration: number;
  teamSize: number;
  sportId: string;
  phone?: string;
}

interface Sport {
  id: string;
  name: string;
  description: string;
  icon: string;
  players: string;
  duration: string;
  priceRange: string;
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="booking-container">
      <div class="booking-header">
        <button class="btn btn-back" (click)="goBack()">
          ← Back to Sports
        </button>
        <h1>Book Your {{ selectedSport()?.name || 'Sport' }}</h1>
        <div class="sport-info" *ngIf="selectedSport()">
          <div class="sport-icon">
            <span>{{ selectedSport()?.icon }}</span>
          </div>
          <div class="sport-details">
            <h3>{{ selectedSport()?.name }}</h3>
            <p>{{ selectedSport()?.description }}</p>
            <div class="sport-meta">
              <span class="meta-item">👥 {{ selectedSport()?.players }}</span>
              <span class="meta-item">⏱️ {{ selectedSport()?.duration }}</span>
              <span class="meta-item">💰 {{ selectedSport()?.priceRange }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="booking-form">
        <div class="form-group">
          <label for="playerName">Player Name</label>
          <input 
            type="text" 
            id="playerName"
            [(ngModel)]="bookingForm().playerName"
            placeholder="Enter your name"
            class="form-control"
          >
        </div>

        <div class="form-group">
          <label for="turfId">Select Turf</label>
          <select 
            id="turfId"
            [(ngModel)]="bookingForm().turfId"
            class="form-control"
          >
            <option value="">Choose a turf</option>
            <option *ngFor="let turf of availableTurfs()" [value]="turf.id">
              {{ turf.name }} - {{ turf.location }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="date">Date</label>
          <input 
            type="date" 
            id="date"
            [(ngModel)]="bookingForm().date"
            class="form-control"
          >
        </div>

        <div class="form-group">
          <label for="timeSlot">Time Slot</label>
          <select 
            id="timeSlot"
            [(ngModel)]="bookingForm().timeSlot"
            class="form-control"
          >
            <option value="">Select time</option>
            <option *ngFor="let slot of timeSlots()" [value]="slot">
              {{ slot }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="duration">Duration (hours)</label>
          <select 
            id="duration"
            [(ngModel)]="bookingForm().duration"
            class="form-control"
          >
            <option value="1">1 hour</option>
            <option value="2">2 hours</option>
            <option value="3">3 hours</option>
          </select>
        </div>

        <div class="form-group">
          <label for="teamSize">Team Size</label>
          <input 
            type="number" 
            id="teamSize"
            [(ngModel)]="bookingForm().teamSize"
            [min]="getMinTeamSize()"
            [max]="getMaxTeamSize()"
            class="form-control"
          >
          <small class="form-help">Recommended: {{ selectedSport()?.players }}</small>
        </div>

        <div class="form-group">
          <label for="phone">Phone Number (for WhatsApp notifications)</label>
          <input 
            type="tel" 
            id="phone"
            [(ngModel)]="bookingForm().phone"
            placeholder="Enter your WhatsApp number"
            class="form-control"
          >
          <small class="form-help">We'll send booking confirmation via WhatsApp</small>
        </div>

        <div class="booking-summary" *ngIf="isFormValid()">
          <h3>Booking Summary</h3>
          <div class="summary-item">
            <span>Sport:</span>
            <span>{{ selectedSport()?.name }}</span>
          </div>
          <div class="summary-item">
            <span>Player:</span>
            <span>{{ bookingForm().playerName }}</span>
          </div>
          <div class="summary-item">
            <span>Turf:</span>
            <span>{{ getSelectedTurfName() }}</span>
          </div>
          <div class="summary-item">
            <span>Date:</span>
            <span>{{ bookingForm().date }}</span>
          </div>
          <div class="summary-item">
            <span>Time:</span>
            <span>{{ bookingForm().timeSlot }}</span>
          </div>
          <div class="summary-item">
            <span>Duration:</span>
            <span>{{ bookingForm().duration }} hour(s)</span>
          </div>
          <div class="summary-item">
            <span>Team Size:</span>
            <span>{{ bookingForm().teamSize }} players</span>
          </div>
          <div class="summary-item total">
            <span>Total Cost:</span>
            <span>{{ '₹' + calculateTotal() }}</span>
          </div>
        </div>

        <div class="booking-actions">
          <button 
            class="btn btn-primary"
            [disabled]="!isFormValid()"
            (click)="submitBooking()"
          >
            Confirm Booking
          </button>
          
          <button 
            class="btn btn-secondary"
            [disabled]="!isFormValid()"
            (click)="shareBooking()"
          >
            📱 Share on WhatsApp
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .booking-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .booking-header {
      margin-bottom: 2rem;
    }

    .btn-back {
      background: none;
      border: none;
      color: #667eea;
      font-weight: 600;
      cursor: pointer;
      padding: 0.5rem 0;
      margin-bottom: 1rem;
    }

    .btn-back:hover {
      text-decoration: underline;
    }

    .booking-header h1 {
      text-align: center;
      color: #333;
      margin-bottom: 2rem;
      font-size: 2.5rem;
    }

    .sport-info {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .sport-icon {
      font-size: 3rem;
      flex-shrink: 0;
    }

    .sport-details h3 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .sport-details p {
      margin-bottom: 1rem;
      opacity: 0.9;
    }

    .sport-meta {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .meta-item {
      background: rgba(255, 255, 255, 0.2);
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.9rem;
    }

    .booking-form {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e1e5e9;
      border-radius: 0.5rem;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-help {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.875rem;
      color: #666;
    }

    .booking-summary {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 0.5rem;
      margin: 2rem 0;
    }

    .booking-summary h3 {
      margin-bottom: 1rem;
      color: #333;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e1e5e9;
    }

    .summary-item:last-child {
      border-bottom: none;
    }

    .summary-item.total {
      font-weight: bold;
      font-size: 1.1rem;
      color: #667eea;
      border-top: 2px solid #667eea;
      padding-top: 1rem;
    }

    .btn {
      width: 100%;
      padding: 1rem;
      border: none;
      border-radius: 0.5rem;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5a6fd8;
      transform: translateY(-2px);
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
    }

    .btn-secondary {
      background: #667eea;
      color: white;
      margin-top: 1rem;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #5a6fd8;
      transform: translateY(-2px);
    }

    .btn-secondary:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
    }

    @media (max-width: 768px) {
      .booking-container {
        padding: 1rem;
      }

      .booking-form {
        padding: 1.5rem;
      }

      .sport-info {
        flex-direction: column;
        text-align: center;
      }

      .sport-meta {
        justify-content: center;
      }
    }
  `]
})
export class BookingComponent implements OnInit {
  // Using Angular 17 Signals for reactive state management
  bookingForm = signal<BookingForm>({
    playerName: '',
    turfId: '',
    date: '',
    timeSlot: '',
    duration: 1,
    teamSize: 1,
    sportId: '',
    phone: ''
  });

  selectedSport = signal<Sport | null>(null);

  availableTurfs = signal([
    { id: '1', name: 'Premium Turf A', location: 'Downtown', pricePerHour: 1500 },
    { id: '2', name: 'Standard Turf B', location: 'Suburb', pricePerHour: 1050 },
    { id: '3', name: 'Elite Turf C', location: 'Sports Complex', pricePerHour: 1800 }
  ]);

  timeSlots = signal([
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
  ]);

  sports = signal<Sport[]>([
    {
      id: 'cricket',
      name: 'Cricket',
      description: 'The gentleman\'s game with bat and ball. Perfect for team matches and tournaments.',
      icon: '🏏',
      players: '11-22 players',
      duration: '2-4 hours',
      priceRange: '₹1500-3000/hour'
    },
    {
      id: 'football',
      name: 'Football',
      description: 'The beautiful game. Fast-paced action with strategic team play.',
      icon: '⚽',
      players: '10-22 players',
      duration: '1-2 hours',
      priceRange: '₹1200-2400/hour'
    },
    {
      id: 'tennis',
      name: 'Tennis',
      description: 'Individual or doubles play. Great for skill development and fitness.',
      icon: '🎾',
      players: '2-4 players',
      duration: '1-2 hours',
      priceRange: '₹900-1800/hour'
    },
    {
      id: 'badminton',
      name: 'Badminton',
      description: 'Fast-paced racket sport. Perfect for singles or doubles matches.',
      icon: '🏸',
      players: '2-4 players',
      duration: '1-2 hours',
      priceRange: '₹750-1500/hour'
    },
    {
      id: 'volleyball',
      name: 'Volleyball',
      description: 'Team sport with net play. Great for coordination and teamwork.',
      icon: '🏐',
      players: '6-12 players',
      duration: '1-2 hours',
      priceRange: '₹1050-2100/hour'
    },
    {
      id: 'basketball',
      name: 'Basketball',
      description: 'High-energy court sport. Perfect for fast-paced action and scoring.',
      icon: '🏀',
      players: '10-20 players',
      duration: '1-2 hours',
      priceRange: '₹1200-2250/hour'
    },
    {
      id: 'hockey',
      name: 'Hockey',
      description: 'Fast-paced stick and ball game. Great for team coordination.',
      icon: '🏑',
      players: '10-22 players',
      duration: '1-2 hours',
      priceRange: '₹1350-2550/hour'
    },
    {
      id: 'table-tennis',
      name: 'Table Tennis',
      description: 'Indoor ping pong. Perfect for quick matches and skill development.',
      icon: '🏓',
      players: '2-4 players',
      duration: '30min-1 hour',
      priceRange: '₹600-1200/hour'
    }
  ]);

  // Computed signal for form validation
  isFormValid = computed(() => {
    const form = this.bookingForm();
    return form.playerName.trim() !== '' &&
           form.turfId !== '' &&
           form.date !== '' &&
           form.timeSlot !== '' &&
           form.teamSize >= 1;
  });

  // Computed signal for total cost calculation
  calculateTotal = computed(() => {
    const form = this.bookingForm();
    const selectedTurf = this.availableTurfs().find(turf => turf.id === form.turfId);
    return selectedTurf ? selectedTurf.pricePerHour * form.duration : 0;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private whatsAppService: WhatsAppService
  ) {}

  ngOnInit() {
    // Get sport ID from route parameters
    this.route.params.subscribe(params => {
      const sportId = params['sportId'];
      if (sportId) {
        const sport = this.sports().find(s => s.id === sportId);
        if (sport) {
          this.selectedSport.set(sport);
          this.bookingForm.update(form => ({ ...form, sportId }));
        } else {
          // If sport not found, redirect to sports page
          this.router.navigate(['/sports']);
        }
      }
    });
  }

  getSelectedTurfName(): string {
    const selectedTurf = this.availableTurfs().find(turf => turf.id === this.bookingForm().turfId);
    return selectedTurf ? selectedTurf.name : '';
  }

  getMinTeamSize(): number {
    const sport = this.selectedSport();
    if (!sport) return 1;
    
    const playerRange = sport.players;
    const minPlayers = playerRange.split('-')[0].replace(/\D/g, '');
    return parseInt(minPlayers) || 1;
  }

  getMaxTeamSize(): number {
    const sport = this.selectedSport();
    if (!sport) return 22;
    
    const playerRange = sport.players;
    const maxPlayers = playerRange.split('-')[1]?.replace(/\D/g, '') || playerRange.replace(/\D/g, '');
    return parseInt(maxPlayers) || 22;
  }

  goBack() {
    this.router.navigate(['/sports']);
  }

  submitBooking() {
    if (this.isFormValid()) {
      const booking = {
        ...this.bookingForm(),
        totalCost: this.calculateTotal(),
        bookingId: this.generateBookingId()
      };
      
      console.log('Booking submitted:', booking);
      alert(`Booking confirmed! Your booking ID is: ${booking.bookingId}`);
      
      // Send WhatsApp notification
      const bookingNotification: BookingNotification = {
        playerName: booking.playerName,
        sport: this.selectedSport()?.name || '',
        turf: this.getSelectedTurfName(),
        date: booking.date,
        time: booking.timeSlot,
        duration: booking.duration,
        teamSize: booking.teamSize,
        totalCost: booking.totalCost,
        bookingId: booking.bookingId
      };
      
      this.whatsAppService.sendBookingConfirmation(bookingNotification, booking.phone);
      
      // Reset form
      this.bookingForm.set({
        playerName: '',
        turfId: '',
        date: '',
        timeSlot: '',
        duration: 1,
        teamSize: 1,
        sportId: this.bookingForm().sportId,
        phone: ''
      });
    }
  }

  shareBooking() {
    if (this.isFormValid()) {
      const bookingNotification: BookingNotification = {
        playerName: this.bookingForm().playerName,
        sport: this.selectedSport()?.name || '',
        turf: this.getSelectedTurfName(),
        date: this.bookingForm().date,
        time: this.bookingForm().timeSlot,
        duration: this.bookingForm().duration,
        teamSize: this.bookingForm().teamSize,
        totalCost: this.calculateTotal(),
        bookingId: this.generateBookingId()
      };
      
      const shareUrl = this.whatsAppService.getBookingShareUrl(bookingNotification);
      window.open(shareUrl, '_blank');
    }
  }

  private generateBookingId(): string {
    return 'BK' + Date.now().toString().slice(-6);
  }
} 