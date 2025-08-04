import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

interface PoolSlot {
  id: string;
  sportId: string;
  sportName: string;
  date: string;
  timeSlot: string;
  duration: number;
  maxPlayers: number;
  currentPlayers: number;
  pricePerPlayer: number;
  status: 'open' | 'filling' | 'full' | 'confirmed';
  players: PoolPlayer[];
}

interface PoolPlayer {
  id: string;
  name: string;
  email: string;
  phone: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  joinedAt: Date;
}

interface PoolBooking {
  playerName: string;
  email: string;
  phone: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  sportId: string;
  date: string;
  timeSlot: string;
  duration: number;
}

@Component({
  selector: 'app-pool',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pool-container">
      <header class="pool-header">
        <button class="btn btn-back" (click)="goBack()">
          ← Back to Sports
        </button>
        <h1>Pool Booking - Join Other Players</h1>
        <p>Book as a single player and get matched with others to form teams!</p>
      </header>

      <div class="pool-content">
        <!-- Pool Booking Form -->
        <div class="pool-form-section" *ngIf="!isBooked()">
          <h2>Join Pool</h2>
          <div class="pool-form">
            <div class="form-group">
              <label for="playerName">Your Name</label>
              <input 
                type="text" 
                id="playerName"
                [(ngModel)]="poolBooking().playerName"
                placeholder="Enter your full name"
                class="form-control"
              >
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email"
                [(ngModel)]="poolBooking().email"
                placeholder="Enter your email"
                class="form-control"
              >
            </div>

            <div class="form-group">
              <label for="phone">Phone Number</label>
              <input 
                type="tel" 
                id="phone"
                [(ngModel)]="poolBooking().phone"
                placeholder="Enter your phone number"
                class="form-control"
              >
            </div>

            <div class="form-group">
              <label for="skillLevel">Skill Level</label>
              <select 
                id="skillLevel"
                [(ngModel)]="poolBooking().skillLevel"
                class="form-control"
              >
                <option value="">Select your skill level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div class="form-group">
              <label for="poolSport">Select Sport</label>
              <select 
                id="poolSport"
                [(ngModel)]="poolBooking().sportId"
                (change)="onSportChange()"
                class="form-control"
              >
                <option value="">Choose a sport</option>
                <option *ngFor="let sport of availableSports()" [value]="sport.id">
                  {{ sport.name }} - {{ sport.poolInfo }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="poolDate">Date</label>
              <input 
                type="date" 
                id="poolDate"
                [(ngModel)]="poolBooking().date"
                (change)="onDateChange()"
                class="form-control"
              >
            </div>

            <div class="form-group">
              <label for="poolTimeSlot">Time Slot</label>
              <select 
                id="poolTimeSlot"
                [(ngModel)]="poolBooking().timeSlot"
                (change)="onTimeSlotChange()"
                class="form-control"
              >
                <option value="">Select time slot</option>
                <option *ngFor="let slot of availableTimeSlots()" [value]="slot">
                  {{ slot }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="poolDuration">Duration</label>
              <select 
                id="poolDuration"
                [(ngModel)]="poolBooking().duration"
                (change)="onDurationChange()"
                class="form-control"
              >
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="3">3 hours</option>
              </select>
            </div>

            <button 
              class="btn btn-primary"
              [disabled]="!isPoolFormValid()"
              (click)="joinPool()"
            >
              Join Pool
            </button>
          </div>
        </div>

        <!-- Available Pools -->
        <div class="pools-section">
          <h2>Available Pools</h2>
          <div class="pools-grid">
            <div 
              class="pool-card" 
              *ngFor="let pool of availablePools()"
              [class.filling]="pool.status === 'filling'"
              [class.full]="pool.status === 'full'"
            >
              <div class="pool-header">
                <div class="sport-info">
                  <span class="sport-icon">{{ getSportIcon(pool.sportId) }}</span>
                  <h3>{{ pool.sportName }}</h3>
                </div>
                <div class="pool-status" [class]="pool.status">
                  {{ getStatusText(pool.status) }}
                </div>
              </div>

              <div class="pool-details">
                <div class="detail-row">
                  <span class="label">Date:</span>
                  <span class="value">{{ pool.date }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Time:</span>
                  <span class="value">{{ pool.timeSlot }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Duration:</span>
                  <span class="value">{{ pool.duration }} hour(s)</span>
                </div>
                <div class="detail-row">
                  <span class="label">Players:</span>
                  <span class="value">{{ pool.currentPlayers }}/{{ pool.maxPlayers }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Price per player:</span>
                  <span class="value">{{ '₹' + pool.pricePerPlayer }}</span>
                </div>
              </div>

              <div class="pool-progress">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    [style.width.%]="(pool.currentPlayers / pool.maxPlayers) * 100"
                  ></div>
                </div>
                <span class="progress-text">{{ pool.currentPlayers }} of {{ pool.maxPlayers }} players</span>
              </div>

              <div class="pool-players" *ngIf="pool.players.length > 0">
                <h4>Joined Players:</h4>
                <div class="players-list">
                  <div class="player-item" *ngFor="let player of pool.players">
                    <span class="player-name">{{ player.name }}</span>
                    <span class="player-skill" [class]="player.skillLevel">{{ player.skillLevel }}</span>
                  </div>
                </div>
              </div>

              <button 
                class="btn btn-join"
                [disabled]="pool.status === 'full' || isBooked()"
                (click)="joinExistingPool(pool)"
              >
                {{ pool.status === 'full' ? 'Pool Full' : 'Join This Pool' }}
              </button>
            </div>
          </div>

          <div class="no-pools" *ngIf="availablePools().length === 0">
            <p>No pools available for the selected criteria.</p>
            <p>Create a new pool booking above!</p>
          </div>
        </div>

        <!-- Booking Confirmation -->
        <div class="booking-confirmation" *ngIf="isBooked()">
          <div class="confirmation-card">
            <div class="confirmation-icon">✅</div>
            <h2>Pool Booking Confirmed!</h2>
            <p>You've successfully joined the pool. We'll notify you when the team is complete.</p>
            
            <div class="booking-details">
              <h3>Booking Details:</h3>
              <div class="detail-item">
                <span>Name:</span>
                <span>{{ confirmedBooking()?.playerName }}</span>
              </div>
              <div class="detail-item">
                <span>Sport:</span>
                <span>{{ getSportName(confirmedBooking()?.sportId || '') }}</span>
              </div>
              <div class="detail-item">
                <span>Date:</span>
                <span>{{ confirmedBooking()?.date }}</span>
              </div>
              <div class="detail-item">
                <span>Time:</span>
                <span>{{ confirmedBooking()?.timeSlot }}</span>
              </div>
              <div class="detail-item">
                <span>Pool ID:</span>
                <span>{{ confirmedBooking()?.poolId }}</span>
              </div>
            </div>

            <div class="confirmation-actions">
              <button class="btn btn-primary" (click)="bookAnother()">
                Book Another Pool
              </button>
              <button class="btn btn-secondary" routerLink="/">
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pool-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .pool-header {
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

    .pool-header h1 {
      font-size: 2.5rem;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .pool-header p {
      font-size: 1.1rem;
      color: #666;
    }

    .pool-content {
      display: grid;
      gap: 2rem;
    }

    .pool-form-section {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .pool-form-section h2 {
      color: #333;
      margin-bottom: 1.5rem;
    }

    .pool-form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem 2.5rem;
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

    .pools-section h2 {
      color: #333;
      margin-bottom: 1.5rem;
    }

    .pools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .pool-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .pool-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .pool-card.filling {
      border-color: #ffc107;
    }

    .pool-card.full {
      border-color: #dc3545;
    }

    .pool-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .sport-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .sport-icon {
      font-size: 1.5rem;
    }

    .sport-info h3 {
      margin: 0;
      color: #333;
    }

    .pool-status {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .pool-status.open {
      background: #d4edda;
      color: #155724;
    }

    .pool-status.filling {
      background: #fff3cd;
      color: #856404;
    }

    .pool-status.full {
      background: #f8d7da;
      color: #721c24;
    }

    .pool-status.confirmed {
      background: #d1ecf1;
      color: #0c5460;
    }

    .pool-details {
      margin-bottom: 1rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .label {
      font-weight: 600;
      color: #333;
    }

    .value {
      color: #667eea;
    }

    .pool-progress {
      margin-bottom: 1rem;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e1e5e9;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: 0.875rem;
      color: #666;
    }

    .pool-players {
      margin-bottom: 1rem;
    }

    .pool-players h4 {
      margin-bottom: 0.5rem;
      color: #333;
    }

    .players-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .player-item {
      background: #f8f9fa;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .player-skill {
      padding: 0.125rem 0.5rem;
      border-radius: 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .player-skill.beginner {
      background: #d4edda;
      color: #155724;
    }

    .player-skill.intermediate {
      background: #fff3cd;
      color: #856404;
    }

    .player-skill.advanced {
      background: #f8d7da;
      color: #721c24;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.5rem;
      font-size: 1rem;
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

    .btn-join {
      background: #28a745;
      color: white;
      width: 100%;
    }

    .btn-join:hover:not(:disabled) {
      background: #218838;
      transform: translateY(-2px);
    }

    .btn-join:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #5a6268;
    }

    .no-pools {
      text-align: center;
      padding: 3rem;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .no-pools p {
      color: #666;
      margin-bottom: 0.5rem;
    }

    .booking-confirmation {
      display: flex;
      justify-content: center;
    }

    .confirmation-card {
      background: white;
      padding: 3rem;
      border-radius: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 500px;
    }

    .confirmation-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .confirmation-card h2 {
      color: #333;
      margin-bottom: 1rem;
    }

    .confirmation-card p {
      color: #666;
      margin-bottom: 2rem;
    }

    .booking-details {
      text-align: left;
      margin-bottom: 2rem;
    }

    .booking-details h3 {
      color: #333;
      margin-bottom: 1rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e1e5e9;
    }

    .confirmation-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    @media (max-width: 768px) {
      .pool-container {
        padding: 1rem;
      }

      .pool-form {
        grid-template-columns: 1fr;
      }

      .pools-grid {
        grid-template-columns: 1fr;
      }

      .confirmation-actions {
        flex-direction: column;
      }
    }
  `]
})
export class PoolComponent implements OnInit {
  // Using Angular 17 Signals for reactive state management
  poolBooking = signal<PoolBooking>({
    playerName: '',
    email: '',
    phone: '',
    skillLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    sportId: '',
    date: '',
    timeSlot: '',
    duration: 1
  });

  isBooked = signal(false);
  confirmedBooking = signal<any>(null);

  availableSports = signal([
    { id: 'cricket', name: 'Cricket', poolInfo: 'Box Cricket - 14 players max' },
    { id: 'football', name: 'Football', poolInfo: '5-a-side - 10 players max' },
    { id: 'basketball', name: 'Basketball', poolInfo: '3v3 - 6 players max' },
    { id: 'volleyball', name: 'Volleyball', poolInfo: '6-a-side - 12 players max' },
    { id: 'tennis', name: 'Tennis', poolInfo: 'Doubles - 4 players max' },
    { id: 'badminton', name: 'Badminton', poolInfo: 'Doubles - 4 players max' }
  ]);

  availableTimeSlots = signal([
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
  ]);

  poolSlots = signal<PoolSlot[]>([]);

  // Computed signals
  availablePools = computed(() => {
    const booking = this.poolBooking();
    return this.poolSlots().filter(pool => 
      pool.sportId === booking.sportId &&
      pool.date === booking.date &&
      pool.timeSlot === booking.timeSlot &&
      pool.duration === booking.duration &&
      pool.status !== 'confirmed'
    );
  });

  isPoolFormValid = computed(() => {
    const booking = this.poolBooking();
    return booking.playerName.trim() !== '' &&
           booking.email.trim() !== '' &&
           booking.phone.trim() !== '' &&
           booking.sportId !== '' &&
           booking.date !== '' &&
           booking.timeSlot !== '' &&
           booking.duration > 0;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Load existing pool data
    this.loadPoolData();
  }

  onSportChange() {
    console.log('Sport changed:', this.poolBooking().sportId);
  }

  onDateChange() {
    console.log('Date changed:', this.poolBooking().date);
  }

  onTimeSlotChange() {
    console.log('Time slot changed:', this.poolBooking().timeSlot);
  }

  onDurationChange() {
    console.log('Duration changed:', this.poolBooking().duration);
  }

  joinPool() {
    if (this.isPoolFormValid()) {
      const booking = this.poolBooking();
      
      // Check if there's an existing pool to join
      const existingPool = this.availablePools().find(pool => 
        pool.currentPlayers < pool.maxPlayers
      );

      if (existingPool) {
        // Join existing pool
        this.joinExistingPool(existingPool);
      } else {
        // Create new pool
        this.createNewPool();
      }
    }
  }

  joinExistingPool(pool: PoolSlot) {
    const booking = this.poolBooking();
    
    // Add player to pool
    const newPlayer: PoolPlayer = {
      id: this.generatePlayerId(),
      name: booking.playerName,
      email: booking.email,
      phone: booking.phone,
      skillLevel: booking.skillLevel,
      joinedAt: new Date()
    };

    // Update pool
    this.poolSlots.update(pools => 
      pools.map(p => {
        if (p.id === pool.id) {
          const updatedPlayers = [...p.players, newPlayer];
          const newStatus = updatedPlayers.length >= p.maxPlayers ? 'full' : 'filling';
          return {
            ...p,
            currentPlayers: updatedPlayers.length,
            players: updatedPlayers,
            status: newStatus
          };
        }
        return p;
      })
    );

    // Confirm booking
    this.confirmedBooking.set({
      ...booking,
      poolId: pool.id,
      poolStatus: pool.status
    });
    this.isBooked.set(true);
  }

  createNewPool() {
    const booking = this.poolBooking();
    const sport = this.availableSports().find(s => s.id === booking.sportId);
    
    const newPool: PoolSlot = {
      id: this.generatePoolId(),
      sportId: booking.sportId,
      sportName: sport?.name || '',
      date: booking.date,
      timeSlot: booking.timeSlot,
      duration: booking.duration,
      maxPlayers: this.getMaxPlayersForSport(booking.sportId),
      currentPlayers: 1,
      pricePerPlayer: this.getPricePerPlayer(booking.sportId),
      status: 'open',
      players: [{
        id: this.generatePlayerId(),
        name: booking.playerName,
        email: booking.email,
        phone: booking.phone,
        skillLevel: booking.skillLevel,
        joinedAt: new Date()
      }]
    };

    this.poolSlots.update(pools => [...pools, newPool]);

    // Confirm booking
    this.confirmedBooking.set({
      ...booking,
      poolId: newPool.id,
      poolStatus: 'open'
    });
    this.isBooked.set(true);
  }

  getSportIcon(sportId: string): string {
    const icons: { [key: string]: string } = {
      cricket: '🏏',
      football: '⚽',
      basketball: '🏀',
      volleyball: '🏐',
      tennis: '🎾',
      badminton: '🏸'
    };
    return icons[sportId] || '🏃';
  }

  getSportName(sportId: string): string {
    const sport = this.availableSports().find(s => s.id === sportId);
    return sport?.name || '';
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      open: 'Open',
      filling: 'Filling',
      full: 'Full',
      confirmed: 'Confirmed'
    };
    return statusMap[status] || status;
  }

  getMaxPlayersForSport(sportId: string): number {
    const maxPlayers: { [key: string]: number } = {
      cricket: 14,
      football: 10,
      basketball: 6,
      volleyball: 12,
      tennis: 4,
      badminton: 4
    };
    return maxPlayers[sportId] || 10;
  }

  getPricePerPlayer(sportId: string): number {
    const prices: { [key: string]: number } = {
      cricket: 750,
      football: 600,
      basketball: 450,
      volleyball: 525,
      tennis: 900,
      badminton: 600
    };
    return prices[sportId] || 600;
  }

  bookAnother() {
    this.isBooked.set(false);
    this.confirmedBooking.set(null);
    this.poolBooking.set({
      playerName: '',
      email: '',
      phone: '',
      skillLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
      sportId: '',
      date: '',
      timeSlot: '',
      duration: 1
    });
  }

  goBack() {
    this.router.navigate(['/sports']);
  }

  private generatePoolId(): string {
    return 'POOL' + Date.now().toString().slice(-6);
  }

  private generatePlayerId(): string {
    return 'PLAYER' + Date.now().toString().slice(-6);
  }

  private loadPoolData() {
    // Simulate loading existing pool data
    const samplePools: PoolSlot[] = [
      {
        id: 'POOL001',
        sportId: 'cricket',
        sportName: 'Cricket',
        date: '2024-01-20',
        timeSlot: '02:00 PM',
        duration: 2,
        maxPlayers: 14,
        currentPlayers: 8,
        pricePerPlayer: 750,
        status: 'filling',
        players: [
          { id: 'P1', name: 'John Doe', email: 'john@email.com', phone: '1234567890', skillLevel: 'intermediate', joinedAt: new Date() },
          { id: 'P2', name: 'Jane Smith', email: 'jane@email.com', phone: '1234567891', skillLevel: 'advanced', joinedAt: new Date() }
        ]
      },
      {
        id: 'POOL002',
        sportId: 'football',
        sportName: 'Football',
        date: '2024-01-20',
        timeSlot: '06:00 PM',
        duration: 1,
        maxPlayers: 10,
        currentPlayers: 10,
        pricePerPlayer: 600,
        status: 'full',
        players: []
      }
    ];

    this.poolSlots.set(samplePools);
  }
} 