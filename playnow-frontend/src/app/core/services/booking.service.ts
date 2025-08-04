import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Booking {
  id: string;
  playerName: string;
  turfId: string;
  turfName: string;
  date: string;
  timeSlot: string;
  duration: number;
  teamSize: number;
  totalCost: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}

export interface Turf {
  id: string;
  name: string;
  location: string;
  pricePerHour: number;
  isAvailable: boolean;
  imageUrl?: string;
}

// Backend DTOs
export interface CreateBookingRequest {
  turfId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  specialRequests?: string;
}

export interface BookingResponse {
  id: number;
  turfId: number;
  turfName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  totalAmount: number;
  status: string;
  specialRequests?: string;
  createdAt: string;
  payment?: PaymentResponse;
}

export interface PaymentResponse {
  id: number;
  paymentMethod: string;
  transactionId: string;
  amount: number;
  status: string;
  paymentDate: string;
}

export interface TurfResponse {
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
  amenities: string[];
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  // Using Angular 17 Signals for reactive state management
  private bookings = signal<Booking[]>([]);
  private turfs = signal<Turf[]>([]);
  private isLoading = signal(false);

  private readonly API_BASE_URL = 'http://localhost:5048/api';

  // Computed signals for derived state
  public readonly allBookings = this.bookings.asReadonly();
  public readonly allTurfs = this.turfs.asReadonly();
  public readonly isLoadingState = this.isLoading.asReadonly();
  
  public readonly availableTurfs = computed(() => 
    this.turfs().filter(turf => turf.isAvailable)
  );

  public readonly totalBookings = computed(() => 
    this.bookings().length
  );

  public readonly confirmedBookings = computed(() => 
    this.bookings().filter(booking => booking.status === 'confirmed')
  );

  public readonly totalRevenue = computed(() => 
    this.confirmedBookings().reduce((total, booking) => total + booking.totalCost, 0)
  );

  constructor(private http: HttpClient, private authService: AuthService) {
    // Load initial data
    this.loadTurfs();
    this.loadUserBookings();
  }

  /**
   * Get HTTP headers with authorization
   */
  private getAuthHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }

  /**
   * Load all available turfs from backend
   */
  loadTurfs(sportType?: string, city?: string): Observable<TurfResponse[]> {
    this.isLoading.set(true);
    
    let url = `${this.API_BASE_URL}/booking/turfs`;
    const params: string[] = [];
    
    if (sportType) params.push(`sportType=${sportType}`);
    if (city) params.push(`city=${city}`);
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<TurfResponse[]>(url)
      .pipe(
        tap(turfs => {
          // Convert backend TurfResponse to frontend Turf
          const convertedTurfs: Turf[] = turfs.map(turf => ({
            id: turf.id.toString(),
            name: turf.name,
            location: turf.address,
            pricePerHour: turf.pricePerHour,
            isAvailable: turf.isAvailable,
            imageUrl: turf.imageUrl
          }));
          
          this.turfs.set(convertedTurfs);
          this.isLoading.set(false);
        }),
        catchError(error => {
          this.isLoading.set(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Load user's bookings from backend
   */
  loadUserBookings(): Observable<BookingResponse[]> {
    this.isLoading.set(true);
    
    return this.http.get<BookingResponse[]>(`${this.API_BASE_URL}/booking/my-bookings`, {
      headers: this.getAuthHeaders()
    })
      .pipe(
        tap(bookings => {
          // Convert backend BookingResponse to frontend Booking
          const convertedBookings: Booking[] = (bookings ?? []).map(booking => ({
            id: booking.id.toString(),
            playerName: 'Current User', // This should come from user context
            turfId: booking.turfId.toString(),
            turfName: booking.turfName,
            date: booking.bookingDate,
            timeSlot: booking.startTime,
            duration: booking.durationHours,
            teamSize: 1, // Default value
            totalCost: booking.totalAmount,
            status: booking.status as 'pending' | 'confirmed' | 'cancelled',
            createdAt: new Date(booking.createdAt)
          }));
          
          this.bookings.set(convertedBookings);
          this.isLoading.set(false);
        }),
        catchError(error => {
          this.isLoading.set(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Create a new booking
   */
  createBooking(bookingData: CreateBookingRequest): Observable<BookingResponse> {
    this.isLoading.set(true);
    
    return this.http.post<BookingResponse>(`${this.API_BASE_URL}/booking`, bookingData, {
      headers: this.getAuthHeaders()
    })
      .pipe(
        tap(response => {
          // Add the new booking to the local state
          const newBooking: Booking = {
            id: response.id.toString(),
            playerName: 'Current User',
            turfId: response.turfId.toString(),
            turfName: response.turfName,
            date: response.bookingDate,
            timeSlot: response.startTime,
            duration: response.durationHours,
            teamSize: 1,
            totalCost: response.totalAmount,
            status: response.status as 'pending' | 'confirmed' | 'cancelled',
            createdAt: new Date(response.createdAt)
          };
          
          this.bookings.update(bookings => [...bookings, newBooking]);
          this.isLoading.set(false);
        }),
        catchError(error => {
          this.isLoading.set(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get booking by ID
   */
  getBookingById(bookingId: string): Observable<BookingResponse> {
    return this.http.get<BookingResponse>(`${this.API_BASE_URL}/booking/${bookingId}`, {
      headers: this.getAuthHeaders()
    })
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Cancel a booking
   */
  cancelBooking(bookingId: string): Observable<any> {
    this.isLoading.set(true);
    
    return this.http.post(`${this.API_BASE_URL}/booking/${bookingId}/cancel`, {}, {
      headers: this.getAuthHeaders()
    })
      .pipe(
        tap(() => {
          // Update local state
          this.bookings.update(bookings =>
            bookings.map(booking =>
              booking.id === bookingId
                ? { ...booking, status: 'cancelled' as const }
                : booking
            )
          );
          this.isLoading.set(false);
        }),
        catchError(error => {
          this.isLoading.set(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get turf by ID
   */
  getTurfById(turfId: string): Turf | undefined {
    return this.turfs().find(turf => turf.id === turfId);
  }

  /**
   * Get bookings for a specific date
   */
  getBookingsForDate(date: string): Booking[] {
    return this.bookings().filter(booking => booking.date === date);
  }

  /**
   * Get bookings for a specific turf
   */
  getBookingsForTurf(turfId: string): Booking[] {
    return this.bookings().filter(booking => booking.turfId === turfId);
  }

  /**
   * Search turfs with filters
   */
  searchTurfs(filters: { sportType?: string; city?: string; priceRange?: string }): Observable<TurfResponse[]> {
    return this.loadTurfs(filters.sportType, filters.city);
  }
} 