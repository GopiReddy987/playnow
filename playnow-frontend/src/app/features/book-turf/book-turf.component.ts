import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TurfService, TurfDetail } from '../../core/services/turf.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-book-turf',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-turf.component.html',
  styleUrls: ['./book-turf.component.scss']
})
export class BookTurfComponent implements OnInit, OnDestroy {
  sports = ['Cricket', 'Football', 'Tennis', 'Badminton', 'Basketball', 'Volleyball'];
  selectedSport = '';
  grounds: TurfDetail[] = [];
  filteredGrounds: TurfDetail[] = [];
  isLoading = false;
  error: string | null = null;

  recommendations = [
    {
      name: 'Meadow Park',
      sport: 'Football',
      distance: '2.1 km away',
      rating: 4.5,
      reviews: 25,
      imageUrl: '/assets/images/turfs/meadow-park.jpg',
      icon: '⚽️'
    },
    {
      name: 'Pinewood Oval',
      sport: 'Cricket',
      distance: '3.8 km away',
      rating: 4.7,
      reviews: 18,
      imageUrl: '/assets/images/turfs/pinewood-oval.jpg',
      icon: '🏏'
    },
    {
      name: 'Willow Courts',
      sport: 'Tennis',
      distance: '1.5 km away',
      rating: 4.3,
      reviews: 10,
      imageUrl: '/assets/images/turfs/willow-courts.jpg',
      icon: '🎾'
    }
  ];

  private subscription = new Subscription();

  constructor(
    private router: Router,
    private turfService: TurfService
  ) {}

  ngOnInit() {
    this.loadTurfs();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadTurfs() {
    this.isLoading = true;
    this.error = null;

    this.subscription.add(
      this.turfService.loadTurfs().subscribe({
        next: (turfs: TurfDetail[]) => {
          this.grounds = turfs;
          this.filterGrounds();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading turfs:', error);
          this.error = 'Failed to load turfs. Please try again.';
          this.isLoading = false;
          
          // Fallback to static data if API fails
          this.loadFallbackData();
        }
      })
    );
  }

  loadFallbackData() {
    // Fallback static data if API is not available
    this.grounds = [
      {
        id: 1,
        name: 'Premium Cricket Ground',
        description: 'Professional cricket ground with floodlights and changing rooms',
        address: 'Banjara Hills',
        city: 'Hyderabad',
        postalCode: '500034',
        latitude: 17.3850,
        longitude: 78.4867,
        sportType: 'Cricket',
        capacity: 22,
        pricePerHour: 1200,
        imageUrl: '/assets/images/turfs/cricket-ground.jpg',
        isAvailable: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timings: [
          { id: 1, dayOfWeek: 'Monday', startTime: '06:00', endTime: '22:00', pricePerHour: 1200, isAvailable: true },
          { id: 2, dayOfWeek: 'Tuesday', startTime: '06:00', endTime: '22:00', pricePerHour: 1200, isAvailable: true }
        ],
        amenities: [
          { id: 1, name: 'Changing Room', description: 'Clean changing facilities', isAvailable: true, additionalCost: 0 },
          { id: 2, name: 'Floodlights', description: 'Evening play available', isAvailable: true, additionalCost: 200 }
        ]
      },
      {
        id: 2,
        name: 'Elite Football Arena',
        description: 'Professional football ground with artificial turf',
        address: 'Gachibowli',
        city: 'Hyderabad',
        postalCode: '500032',
        latitude: 17.4450,
        longitude: 78.3467,
        sportType: 'Football',
        capacity: 14,
        pricePerHour: 800,
        imageUrl: '/assets/images/turfs/football-ground.jpg',
        isAvailable: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timings: [
          { id: 3, dayOfWeek: 'Monday', startTime: '06:00', endTime: '22:00', pricePerHour: 800, isAvailable: true },
          { id: 4, dayOfWeek: 'Tuesday', startTime: '06:00', endTime: '22:00', pricePerHour: 800, isAvailable: true }
        ],
        amenities: [
          { id: 3, name: 'Equipment Rental', description: 'Football equipment available', isAvailable: true, additionalCost: 100 }
        ]
      },
      {
        id: 3,
        name: 'Tennis Court Complex',
        description: 'Professional tennis courts with coaching facilities',
        address: 'Jubilee Hills',
        city: 'Hyderabad',
        postalCode: '500033',
        latitude: 17.4250,
        longitude: 78.4067,
        sportType: 'Tennis',
        capacity: 4,
        pricePerHour: 600,
        imageUrl: '/assets/images/turfs/tennis-court.jpg',
        isAvailable: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timings: [
          { id: 5, dayOfWeek: 'Monday', startTime: '06:00', endTime: '22:00', pricePerHour: 600, isAvailable: true },
          { id: 6, dayOfWeek: 'Tuesday', startTime: '06:00', endTime: '22:00', pricePerHour: 600, isAvailable: true }
        ],
        amenities: [
          { id: 4, name: 'Coach Available', description: 'Professional tennis coach', isAvailable: true, additionalCost: 300 }
        ]
      }
    ];
    this.filterGrounds();
  }

  filterGrounds() {
    if (!this.selectedSport) {
      this.filteredGrounds = this.grounds.filter(ground => ground.isAvailable && ground.isActive);
    } else {
      this.filteredGrounds = this.grounds.filter(ground => 
        ground.sportType === this.selectedSport && ground.isAvailable && ground.isActive
      );
    }
  }

  goToBooking(groundId: number) {
    this.router.navigate(['/book-ground', groundId]);
  }

  retryLoad() {
    this.loadTurfs();
  }

  getAvailableAmenities(ground: TurfDetail): string[] {
    return ground.amenities
      .filter(amenity => amenity.isAvailable)
      .map(amenity => amenity.name);
  }

  getAmenityCost(ground: TurfDetail): number {
    return ground.amenities
      .filter(amenity => amenity.isAvailable && amenity.additionalCost)
      .reduce((total, amenity) => total + (amenity.additionalCost || 0), 0);
  }
} 