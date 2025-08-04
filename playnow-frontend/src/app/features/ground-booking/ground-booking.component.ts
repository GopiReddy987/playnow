import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

interface TurfDetail {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  sportType: string;
  capacity: number;
  pricePerHour: number;
  imageUrl?: string;
  isAvailable: boolean;
  timings: TurfTiming[];
  amenities: TurfAmenity[];
}

interface TurfTiming {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  pricePerHour: number;
  isAvailable: boolean;
}

interface TurfAmenity {
  id: number;
  name: string;
  description?: string;
  isAvailable: boolean;
  additionalCost?: number;
}

interface BookingRequest {
  turfId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  specialRequests?: string;
}

@Component({
  selector: 'app-ground-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ground-booking.component.html',
  styleUrl: './ground-booking.component.scss'
})
export class GroundBookingComponent implements OnInit {
  groundId: string | null = null;
  ground: TurfDetail | null = null;
  isLoading = true;
  error: string | null = null;
  bookingForm: FormGroup;
  selectedDate: string = '';
  availableSlots: string[] = [];
  isSubmitting = false;
  minDate: string = new Date().toISOString().split('T')[0];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.bookingForm = this.fb.group({
      bookingDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      specialRequests: ['']
    });
  }

  ngOnInit(): void {
    this.groundId = this.route.snapshot.paramMap.get('id');
    if (this.groundId) {
      this.getGroundDetails(this.groundId);
    } else {
      this.error = 'Ground ID not provided';
      this.isLoading = false;
    }
  }

  async getGroundDetails(id: string) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response: any = await this.http.get(`http://localhost:5048/api/turf/${id}`).toPromise();
      this.ground = response;
      
      // Set minimum date to today
      const today = new Date().toISOString().split('T')[0];
      this.bookingForm.patchValue({ bookingDate: today });
      this.selectedDate = today;
      
      this.generateAvailableSlots();
    } catch (error) {
      console.error('Error fetching ground details:', error);
      this.error = 'Failed to load ground details. Please try again.';
      this.loadFallbackData();
    } finally {
      this.isLoading = false;
    }
  }

  loadFallbackData() {
    this.ground = {
      id: 1,
      name: 'Elite Cricket Ground',
      description: 'Premium cricket ground with floodlights, changing rooms, and parking. Perfect for both practice sessions and competitive matches.',
      address: 'Banjara Hills',
      city: 'Hyderabad',
      sportType: 'Cricket',
      capacity: 22,
      pricePerHour: 1200,
      imageUrl: '/assets/images/turfs/elite-cricket-ground.jpg',
      isAvailable: true,
      timings: [
        { id: 1, dayOfWeek: 'Monday', startTime: '06:00', endTime: '22:00', pricePerHour: 1200, isAvailable: true },
        { id: 2, dayOfWeek: 'Tuesday', startTime: '06:00', endTime: '22:00', pricePerHour: 1200, isAvailable: true },
        { id: 3, dayOfWeek: 'Wednesday', startTime: '06:00', endTime: '22:00', pricePerHour: 1200, isAvailable: true },
        { id: 4, dayOfWeek: 'Thursday', startTime: '06:00', endTime: '22:00', pricePerHour: 1200, isAvailable: true },
        { id: 5, dayOfWeek: 'Friday', startTime: '06:00', endTime: '22:00', pricePerHour: 1200, isAvailable: true },
        { id: 6, dayOfWeek: 'Saturday', startTime: '06:00', endTime: '22:00', pricePerHour: 1400, isAvailable: true },
        { id: 7, dayOfWeek: 'Sunday', startTime: '06:00', endTime: '22:00', pricePerHour: 1400, isAvailable: true }
      ],
      amenities: [
        { id: 1, name: 'Changing Rooms', description: 'Clean and spacious changing facilities', isAvailable: true, additionalCost: 0 },
        { id: 2, name: 'Floodlights', description: 'Evening play available', isAvailable: true, additionalCost: 200 },
        { id: 3, name: 'Parking', description: 'Free parking available', isAvailable: true, additionalCost: 0 },
        { id: 4, name: 'Equipment Rental', description: 'Cricket equipment available for rent', isAvailable: true, additionalCost: 150 }
      ]
    };
    this.generateAvailableSlots();
  }

  onDateChange() {
    this.selectedDate = this.bookingForm.get('bookingDate')?.value;
    this.generateAvailableSlots();
  }

  generateAvailableSlots() {
    if (!this.ground || !this.selectedDate) return;

    const selectedDay = new Date(this.selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
    const dayTiming = this.ground.timings.find(t => t.dayOfWeek === selectedDay);

    if (!dayTiming || !dayTiming.isAvailable) {
      this.availableSlots = [];
      return;
    }

    const slots: string[] = [];
    const startTime = new Date(`2000-01-01T${dayTiming.startTime}`);
    const endTime = new Date(`2000-01-01T${dayTiming.endTime}`);
    
    // Generate 2-hour slots
    let currentTime = new Date(startTime);
    while (currentTime < endTime) {
      const slotEnd = new Date(currentTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours
      if (slotEnd <= endTime) {
        slots.push(currentTime.toTimeString().slice(0, 5));
      }
      currentTime = slotEnd;
    }

    this.availableSlots = slots;
  }

  calculateDuration(): number {
    const startTime = this.bookingForm.get('startTime')?.value;
    const endTime = this.bookingForm.get('endTime')?.value;
    
    if (!startTime || !endTime) return 0;
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
  }

  calculateTotalPrice(): number {
    if (!this.ground) return 0;
    
    const duration = this.calculateDuration();
    const basePrice = this.ground.pricePerHour * duration;
    
    // Add amenity costs
    let amenityCost = 0;
    this.ground.amenities.forEach(amenity => {
      if (amenity.isAvailable && amenity.additionalCost) {
        amenityCost += amenity.additionalCost;
      }
    });
    
    return basePrice + amenityCost;
  }

  async onSubmit() {
    if (this.bookingForm.invalid || !this.ground) return;

    this.isSubmitting = true;
    const formValue = this.bookingForm.value;

    try {
      const bookingRequest: BookingRequest = {
        turfId: this.ground.id,
        bookingDate: formValue.bookingDate,
        startTime: formValue.startTime,
        endTime: formValue.endTime,
        specialRequests: formValue.specialRequests || undefined
      };

      const response: any = await this.http.post('http://localhost:5048/api/booking', bookingRequest).toPromise();
      
      // Navigate to payment or booking confirmation
      this.router.navigate(['/payment', response.id]);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      this.error = error.error?.message || 'Failed to create booking. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  getDayTiming(dayOfWeek: string): TurfTiming | undefined {
    return this.ground?.timings.find(t => t.dayOfWeek === dayOfWeek);
  }

  getAvailableAmenities(): TurfAmenity[] {
    return this.ground?.amenities.filter(a => a.isAvailable) || [];
  }
}
