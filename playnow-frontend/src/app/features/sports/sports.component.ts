import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Turf {
  id: string;
  name: string;
  sport: string;
  location: string;
  area: string;
  city: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  amenities: string[];
  description: string;
  availableSlots: string[];
  distance: string;
}

interface FilterOptions {
  city: string;
  sport: string;
  priceRange: string;
  rating: number;
  timeSlot: string;
}

@Component({
  selector: 'app-sports',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="turf-booking-container">
      <!-- Header Section -->
      <header class="booking-header">
        <div class="header-content">
          <h1>🏟️ Book Your Perfect Turf</h1>
          <p>Find and book the best sports grounds in your area</p>
        </div>
      </header>

      <!-- Search and Filter Section -->
      <div class="search-filter-section">
        <!-- Main Search Bar -->
        <div class="main-search">
          <div class="search-container">
            <div class="search-icon">🔍</div>
            <input 
              type="text" 
              [value]="searchQuery()"
              placeholder="Search turfs, sports, or areas... (e.g., Cricket Madhapur)"
              class="search-input"
              (input)="onSearchInput($event)"
            >
            <button 
              *ngIf="searchQuery()" 
              class="clear-search" 
              (click)="clearSearch()"
            >
              ✕
            </button>
          </div>
          <button class="filter-toggle" (click)="toggleFilters()">
            🔧 Filters
          </button>
        </div>

        <!-- Filter Panel -->
        <div class="filter-panel" [class.active]="showFilters()">
          <div class="filter-grid">
            <!-- City Filter -->
            <div class="filter-group">
              <label>📍 City</label>
              <select [(ngModel)]="filters().city" (change)="applyFilters()">
                <option value="">All Cities</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Chennai">Chennai</option>
              </select>
            </div>

            <!-- Sport Filter -->
            <div class="filter-group">
              <label>⚽ Sport</label>
              <select [(ngModel)]="filters().sport" (change)="applyFilters()">
                <option value="">All Sports</option>
                <option value="Cricket">Cricket</option>
                <option value="Football">Football</option>
                <option value="Tennis">Tennis</option>
                <option value="Badminton">Badminton</option>
                <option value="Basketball">Basketball</option>
                <option value="Volleyball">Volleyball</option>
              </select>
            </div>

            <!-- Price Range Filter -->
            <div class="filter-group">
              <label>💰 Price Range</label>
              <select [(ngModel)]="filters().priceRange" (change)="applyFilters()">
                <option value="">Any Price</option>
                <option value="0-1000">Under ₹1000/hour</option>
                <option value="1000-2000">₹1000-2000/hour</option>
                <option value="2000-3000">₹2000-3000/hour</option>
                <option value="3000+">Above ₹3000/hour</option>
              </select>
            </div>

            <!-- Rating Filter -->
            <div class="filter-group">
              <label>⭐ Rating</label>
              <select [(ngModel)]="filters().rating" (change)="applyFilters()">
                <option value="0">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>

            <!-- Time Slot Filter -->
            <div class="filter-group">
              <label>🕐 Time Slot</label>
              <select [(ngModel)]="filters().timeSlot" (change)="applyFilters()">
                <option value="">Any Time</option>
                <option value="morning">Morning (6AM-12PM)</option>
                <option value="afternoon">Afternoon (12PM-6PM)</option>
                <option value="evening">Evening (6PM-12AM)</option>
              </select>
            </div>

            <!-- Clear Filters -->
            <div class="filter-group">
              <button class="clear-filters-btn" (click)="clearFilters()">
                🗑️ Clear All Filters
              </button>
            </div>
          </div>
        </div>

        <!-- Search Stats -->
        <div class="search-stats" *ngIf="searchQuery() || hasActiveFilters()">
          <span>{{ filteredTurfs().length }} turfs found</span>
          <span *ngIf="searchQuery()">for "{{ searchQuery() }}"</span>
        </div>
      </div>

      <!-- Turf Grid -->
      <div class="turf-grid">
        <div 
          class="turf-card" 
          *ngFor="let turf of filteredTurfs()"
          (click)="selectTurf(turf)"
        >
          <div class="turf-image">
            <img [src]="turf.imageUrl" [alt]="turf.name">
            <div class="turf-badge">{{ turf.sport }}</div>
            <div class="turf-rating">
              <span class="stars">⭐</span>
              <span class="rating-text">{{ turf.rating }} ({{ turf.reviewCount }})</span>
            </div>
          </div>
          
          <div class="turf-content">
            <h3 class="turf-name">{{ turf.name }}</h3>
            <p class="turf-location">📍 {{ turf.location }}, {{ turf.city }}</p>
            <p class="turf-distance">{{ turf.distance }} away</p>
            
            <div class="turf-amenities">
              <span class="amenity" *ngFor="let amenity of turf.amenities.slice(0, 3)">
                {{ amenity }}
              </span>
              <span class="amenity-more" *ngIf="turf.amenities.length > 3">
                +{{ turf.amenities.length - 3 }} more
              </span>
            </div>
            
            <div class="turf-price">
              <span class="price">₹{{ turf.hourlyRate }}/hour</span>
              <button class="book-now-btn" (click)="openBookingModal(turf, $event)">
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div class="no-results" *ngIf="filteredTurfs().length === 0">
        <div class="no-results-content">
          <div class="no-results-icon">🏟️</div>
          <h3>No turfs found</h3>
          <p>Try adjusting your search or filters</p>
          <button class="btn btn-primary" (click)="clearAllFilters()">
            Show All Turfs
          </button>
        </div>
      </div>

      <!-- Booking Modal -->
      <div class="modal-overlay" *ngIf="showBookingModal()" (click)="closeBookingModal()">
        <div class="booking-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Book {{ selectedTurf()?.name }}</h2>
            <button class="close-btn" (click)="closeBookingModal()">✕</button>
          </div>
          
          <div class="modal-content">
            <div class="turf-info">
              <img [src]="selectedTurf()?.imageUrl" [alt]="selectedTurf()?.name">
              <div class="turf-details">
                <h3>{{ selectedTurf()?.name }}</h3>
                <p>📍 {{ selectedTurf()?.location }}, {{ selectedTurf()?.city }}</p>
                <p>⭐ {{ selectedTurf()?.rating }} ({{ selectedTurf()?.reviewCount }} reviews)</p>
              </div>
            </div>

            <!-- Date Selection -->
            <div class="booking-section">
              <h4>📅 Select Date</h4>
              <div class="date-picker">
                <input 
                  type="date" 
                  [min]="today"
                  [(ngModel)]="selectedDate"
                  (change)="onDateChange()"
                >
              </div>
            </div>

            <!-- Time Slot Selection -->
            <div class="booking-section">
              <h4>🕐 Select Time Slot</h4>
              <div class="time-slots">
                <button 
                  *ngFor="let slot of availableTimeSlots()"
                  class="time-slot"
                  [class.selected]="selectedTimeSlot() === slot"
                  [class.available]="isSlotAvailable(slot)"
                  [class.unavailable]="!isSlotAvailable(slot)"
                  (click)="selectTimeSlot(slot)"
                  [disabled]="!isSlotAvailable(slot)"
                >
                  {{ slot }}
                </button>
              </div>
            </div>

            <!-- Duration Selection -->
            <div class="booking-section">
              <h4>⏱️ Select Duration</h4>
              <div class="duration-selector">
                <button 
                  *ngFor="let duration of [1, 2, 3, 4]"
                  class="duration-btn"
                  [class.selected]="selectedDuration() === duration"
                  (click)="selectDuration(duration)"
                >
                  {{ duration }} Hour{{ duration > 1 ? 's' : '' }}
                </button>
              </div>
            </div>

            <!-- Price Calculation -->
            <div class="price-calculation">
              <div class="price-breakdown">
                <div class="price-item">
                  <span>Rate per hour:</span>
                  <span>₹{{ selectedTurf()?.hourlyRate }}</span>
                </div>
                <div class="price-item">
                  <span>Duration:</span>
                  <span>{{ selectedDuration() }} hour{{ selectedDuration() > 1 ? 's' : '' }}</span>
                </div>
                <div class="price-item total">
                  <span>Total Amount:</span>
                  <span>₹{{ calculateTotalPrice() }}</span>
                </div>
              </div>
            </div>

            <!-- Booking Actions -->
            <div class="booking-actions">
              <button class="btn btn-secondary" (click)="closeBookingModal()">
                Cancel
              </button>
              <button 
                class="btn btn-primary" 
                [disabled]="!canBook()"
                (click)="confirmBooking()"
              >
                💳 Confirm Booking - ₹{{ calculateTotalPrice() }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .turf-booking-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .booking-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 3rem 2rem;
      text-align: center;
    }

    .header-content h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .header-content p {
      font-size: 1.2rem;
      opacity: 0.9;
    }

    .search-filter-section {
      background: white;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .main-search {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .search-container {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      background: white;
      border: 2px solid #e1e5e9;
      border-radius: 2rem;
      padding: 0.75rem 1rem;
      transition: all 0.3s ease;
    }

    .search-container:focus-within {
      border-color: #667eea;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }

    .search-icon {
      font-size: 1.2rem;
      color: #666;
      margin-right: 0.75rem;
    }

    .search-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 1rem;
      background: transparent;
    }

    .clear-search {
      background: none;
      border: none;
      color: #666;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .filter-toggle {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 2rem;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .filter-toggle:hover {
      background: #5a6fd8;
    }

    .filter-panel {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }

    .filter-panel.active {
      max-height: 300px;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e1e5e9;
    }

    .filter-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-weight: 600;
      color: #333;
      font-size: 0.9rem;
    }

    .filter-group select {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 0.5rem;
      background: white;
    }

    .clear-filters-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .search-stats {
      margin-top: 1rem;
      font-size: 0.9rem;
      color: #666;
    }

    .turf-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 2rem;
      padding: 2rem;
    }

    .turf-card {
      background: white;
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .turf-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .turf-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .turf-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .turf-badge {
      position: absolute;
      top: 1rem;
      left: 1rem;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .turf-rating {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.8rem;
    }

    .turf-content {
      padding: 1.5rem;
    }

    .turf-name {
      font-size: 1.3rem;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .turf-location {
      color: #666;
      margin-bottom: 0.25rem;
      font-size: 0.9rem;
    }

    .turf-distance {
      color: #999;
      font-size: 0.8rem;
      margin-bottom: 1rem;
    }

    .turf-amenities {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .amenity {
      background: #f0f0f0;
      color: #666;
      padding: 0.25rem 0.5rem;
      border-radius: 0.5rem;
      font-size: 0.8rem;
    }

    .amenity-more {
      color: #667eea;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .turf-price {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .price {
      font-size: 1.2rem;
      font-weight: 600;
      color: #333;
    }

    .book-now-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .book-now-btn:hover {
      background: #5a6fd8;
    }

    .no-results {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 1rem;
      margin: 2rem;
    }

    .no-results-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 2rem;
    }

    .booking-modal {
      background: white;
      border-radius: 1rem;
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e1e5e9;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
    }

    .modal-content {
      padding: 1.5rem;
    }

    .turf-info {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e1e5e9;
    }

    .turf-info img {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 0.5rem;
    }

    .booking-section {
      margin-bottom: 2rem;
    }

    .booking-section h4 {
      margin-bottom: 1rem;
      color: #333;
    }

    .date-picker input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 0.5rem;
    }

    .time-slots {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 0.5rem;
    }

    .time-slot {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 0.5rem;
      background: white;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .time-slot.selected {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .time-slot.available:hover {
      border-color: #667eea;
    }

    .time-slot.unavailable {
      background: #f0f0f0;
      color: #999;
      cursor: not-allowed;
    }

    .duration-selector {
      display: flex;
      gap: 0.5rem;
    }

    .duration-btn {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 0.5rem;
      background: white;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .duration-btn.selected {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .price-calculation {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 2rem;
    }

    .price-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .price-item.total {
      font-weight: 600;
      font-size: 1.1rem;
      border-top: 1px solid #ddd;
      padding-top: 0.5rem;
      margin-top: 0.5rem;
    }

    .booking-actions {
      display: flex;
      gap: 1rem;
    }

    .btn {
      flex: 1;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    @media (max-width: 768px) {
      .turf-grid {
        grid-template-columns: 1fr;
        padding: 1rem;
      }

      .main-search {
        flex-direction: column;
      }

      .filter-grid {
        grid-template-columns: 1fr;
      }

      .booking-modal {
        margin: 1rem;
        max-height: 95vh;
      }

      .turf-info {
        flex-direction: column;
        text-align: center;
      }

      .booking-actions {
        flex-direction: column;
      }
    }
  `]
})
export class SportsComponent {
  // Signals for reactive state management
  searchQuery = signal('');
  showFilters = signal(false);
  showBookingModal = signal(false);
  selectedTurf = signal<Turf | null>(null);
  selectedDate = '';
  selectedTimeSlot = signal('');
  selectedDuration = signal(1);

  // Filter options
  filters = signal<FilterOptions>({
    city: '',
    sport: '',
    priceRange: '',
    rating: 0,
    timeSlot: ''
  });

  // Sample turf data
  allTurfs = signal<Turf[]>([
    {
      id: 'turf1',
      name: 'Elite Cricket Ground',
      sport: 'Cricket',
      location: 'Madhapur',
      area: 'Hitech City',
      city: 'Hyderabad',
      hourlyRate: 2500,
      rating: 4.8,
      reviewCount: 156,
      imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400',
      amenities: ['Floodlights', 'Pavilion', 'Parking', 'Refreshments'],
      description: 'Professional cricket ground with international standards',
      availableSlots: ['06:00-08:00', '08:00-10:00', '16:00-18:00', '18:00-20:00'],
      distance: '2.5 km'
    },
    {
      id: 'turf2',
      name: 'Green Valley Football',
      sport: 'Football',
      location: 'Gachibowli',
      area: 'Financial District',
      city: 'Hyderabad',
      hourlyRate: 1800,
      rating: 4.5,
      reviewCount: 89,
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      amenities: ['Artificial Turf', 'Goal Posts', 'Changing Rooms', 'Water Dispenser'],
      description: 'Premium football ground with artificial turf',
      availableSlots: ['06:00-08:00', '08:00-10:00', '17:00-19:00', '19:00-21:00'],
      distance: '3.2 km'
    },
    {
      id: 'turf3',
      name: 'Tennis Pro Court',
      sport: 'Tennis',
      location: 'Jubilee Hills',
      area: 'Banjara Hills',
      city: 'Hyderabad',
      hourlyRate: 1200,
      rating: 4.9,
      reviewCount: 234,
      imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400',
      amenities: ['Hard Court', 'Net', 'Ball Machine', 'Coach Available'],
      description: 'Professional tennis court with coaching facilities',
      availableSlots: ['07:00-09:00', '09:00-11:00', '16:00-18:00', '18:00-20:00'],
      distance: '1.8 km'
    },
    {
      id: 'turf4',
      name: 'Badminton Arena',
      sport: 'Badminton',
      location: 'Kukatpally',
      area: 'Kukatpally',
      city: 'Hyderabad',
      hourlyRate: 800,
      rating: 4.3,
      reviewCount: 67,
      imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400',
      amenities: ['Wooden Court', 'Nets', 'AC', 'Shuttlecocks'],
      description: 'Indoor badminton court with air conditioning',
      availableSlots: ['08:00-10:00', '10:00-12:00', '18:00-20:00', '20:00-22:00'],
      distance: '4.1 km'
    },
    {
      id: 'turf5',
      name: 'Basketball Zone',
      sport: 'Basketball',
      location: 'Secunderabad',
      area: 'Secunderabad',
      city: 'Hyderabad',
      hourlyRate: 1500,
      rating: 4.6,
      reviewCount: 123,
      imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
      amenities: ['Indoor Court', 'Baskets', 'Scoreboard', 'Locker Rooms'],
      description: 'Indoor basketball court with professional equipment',
      availableSlots: ['06:00-08:00', '08:00-10:00', '17:00-19:00', '19:00-21:00'],
      distance: '5.3 km'
    },
    {
      id: 'turf6',
      name: 'Volleyball Court',
      sport: 'Volleyball',
      location: 'Dilsukhnagar',
      area: 'Dilsukhnagar',
      city: 'Hyderabad',
      hourlyRate: 1000,
      rating: 4.2,
      reviewCount: 45,
      imageUrl: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400',
      amenities: ['Sand Court', 'Net', 'Boundary Lines', 'Seating'],
      description: 'Beach volleyball style court with sand surface',
      availableSlots: ['07:00-09:00', '09:00-11:00', '16:00-18:00', '18:00-20:00'],
      distance: '6.7 km'
    }
  ]);

  // Computed signals
  filteredTurfs = computed(() => {
    let turfs = this.allTurfs();
    
    // Search filter
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      turfs = turfs.filter(turf => 
        turf.name.toLowerCase().includes(query) ||
        turf.sport.toLowerCase().includes(query) ||
        turf.location.toLowerCase().includes(query) ||
        turf.area.toLowerCase().includes(query) ||
        turf.city.toLowerCase().includes(query)
      );
    }
    
    // Apply other filters
    const filters = this.filters();
    
    if (filters.city) {
      turfs = turfs.filter(turf => turf.city === filters.city);
    }
    
    if (filters.sport) {
      turfs = turfs.filter(turf => turf.sport === filters.sport);
    }
    
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(p => 
        p === '+' ? Infinity : parseInt(p)
      );
      turfs = turfs.filter(turf => 
        turf.hourlyRate >= min && (max === Infinity ? true : turf.hourlyRate <= max)
      );
    }
    
    if (filters.rating > 0) {
      turfs = turfs.filter(turf => turf.rating >= filters.rating);
    }
    
    return turfs;
  });

  availableTimeSlots = computed(() => {
    return ['06:00-08:00', '08:00-10:00', '10:00-12:00', '16:00-18:00', '18:00-20:00', '20:00-22:00'];
  });

  // Get today's date for date picker
  get today(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Methods
  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.searchQuery.set(target.value);
    }
  }

  clearSearch() {
    this.searchQuery.set('');
  }

  toggleFilters() {
    this.showFilters.update(show => !show);
  }

  applyFilters() {
    // Filters are applied automatically through computed signal
    console.log('Filters applied:', this.filters());
  }

  clearFilters() {
    this.filters.set({
      city: '',
      sport: '',
      priceRange: '',
      rating: 0,
      timeSlot: ''
    });
  }

  clearAllFilters() {
    this.clearSearch();
    this.clearFilters();
  }

  hasActiveFilters(): boolean {
    const filters = this.filters();
    return !!(filters.city || filters.sport || filters.priceRange || filters.rating > 0 || filters.timeSlot);
  }

  selectTurf(turf: Turf) {
    this.selectedTurf.set(turf);
    this.openBookingModal(turf);
  }

  openBookingModal(turf: Turf, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.selectedTurf.set(turf);
    this.showBookingModal.set(true);
    this.selectedDate = this.today;
    this.selectedTimeSlot.set('');
    this.selectedDuration.set(1);
  }

  closeBookingModal() {
    this.showBookingModal.set(false);
    this.selectedTurf.set(null);
  }

  onDateChange() {
    this.selectedTimeSlot.set('');
  }

  selectTimeSlot(slot: string) {
    this.selectedTimeSlot.set(slot);
  }

  selectDuration(duration: number) {
    this.selectedDuration.set(duration);
  }

  isSlotAvailable(slot: string): boolean {
    // Simulate slot availability - in real app, this would check against bookings
    const turf = this.selectedTurf();
    if (!turf) return false;
    return turf.availableSlots.includes(slot);
  }

  calculateTotalPrice(): number {
    const turf = this.selectedTurf();
    if (!turf) return 0;
    return turf.hourlyRate * this.selectedDuration();
  }

  canBook(): boolean {
    return !!(this.selectedTurf() && this.selectedDate && this.selectedTimeSlot() && this.selectedDuration());
  }

  confirmBooking() {
    const booking = {
      turf: this.selectedTurf(),
      date: this.selectedDate,
      timeSlot: this.selectedTimeSlot(),
      duration: this.selectedDuration(),
      totalPrice: this.calculateTotalPrice(),
      bookingId: 'BK' + Date.now()
    };

    console.log('Booking confirmed:', booking);
    
    // Here you would typically:
    // 1. Send booking to backend
    // 2. Process payment
    // 3. Show confirmation
    
    alert(`Booking confirmed! Booking ID: ${booking.bookingId}\nTotal: ₹${booking.totalPrice}`);
    this.closeBookingModal();
  }
} 