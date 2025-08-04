import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, map } from 'rxjs';

export interface TurfDetail {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  sportType: string;
  capacity: number;
  pricePerHour: number;
  imageUrl?: string;
  isAvailable: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  timings: TurfTiming[];
  amenities: TurfAmenity[];
}

export interface TurfTiming {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  pricePerHour: number;
  isAvailable: boolean;
}

export interface TurfAmenity {
  id: number;
  name: string;
  description?: string;
  isAvailable: boolean;
  additionalCost?: number;
}

export interface CreateTurfRequest {
  name: string;
  description: string;
  address: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  sportType: string;
  capacity: number;
  pricePerHour: number;
  imageUrl?: string;
  timings: TurfTimingRequest[];
  amenities: TurfAmenityRequest[];
}

export interface UpdateTurfRequest extends CreateTurfRequest {
  isAvailable: boolean;
  isActive: boolean;
}

export interface TurfTimingRequest {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  pricePerHour: number;
  isAvailable: boolean;
}

export interface TurfAmenityRequest {
  name: string;
  description?: string;
  isAvailable: boolean;
  additionalCost?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TurfService {
  private turfs = signal<TurfDetail[]>([]);
  private isLoading = signal(false);
  private error = signal<string | null>(null);

  private readonly API_BASE_URL = 'http://localhost:5048/api';

  // Computed signals
  public readonly allTurfs = this.turfs.asReadonly();
  public readonly isLoadingState = this.isLoading.asReadonly();
  public readonly errorState = this.error.asReadonly();

  public readonly availableTurfs = computed(() => 
    this.turfs().filter(turf => turf.isAvailable && turf.isActive)
  );

  public readonly turfsBySport = computed(() => {
    const turfs = this.turfs();
    const grouped: { [key: string]: TurfDetail[] } = {};
    turfs.forEach(turf => {
      if (!grouped[turf.sportType]) {
        grouped[turf.sportType] = [];
      }
      grouped[turf.sportType].push(turf);
    });
    return grouped;
  });

  constructor(private http: HttpClient) {
    this.loadTurfs();
  }

  /**
   * Load all turfs from backend
   */
  loadTurfs(): Observable<TurfDetail[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<TurfDetail[]>(`${this.API_BASE_URL}/turf`)
      .pipe(
        tap(turfs => {
          this.turfs.set(turfs);
          this.isLoading.set(false);
        }),
        catchError(error => {
          this.isLoading.set(false);
          this.error.set('Failed to load turfs');
          return throwError(() => error);
        })
      );
  }

  /**
   * Get turf by ID
   */
  getTurfById(id: number): Observable<TurfDetail> {
    return this.http.get<TurfDetail>(`${this.API_BASE_URL}/turf/${id}`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to load turf details');
          return throwError(() => error);
        })
      );
  }

  /**
   * Create new turf
   */
  createTurf(request: CreateTurfRequest): Observable<TurfDetail> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.post<TurfDetail>(`${this.API_BASE_URL}/turf`, request)
      .pipe(
        tap(turf => {
          this.turfs.update(turfs => [...turfs, turf]);
          this.isLoading.set(false);
        }),
        catchError(error => {
          this.isLoading.set(false);
          this.error.set('Failed to create turf');
          return throwError(() => error);
        })
      );
  }

  /**
   * Update existing turf
   */
  updateTurf(id: number, request: UpdateTurfRequest): Observable<TurfDetail> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.put<TurfDetail>(`${this.API_BASE_URL}/turf/${id}`, request)
      .pipe(
        tap(updatedTurf => {
          this.turfs.update(turfs => 
            turfs.map(turf => turf.id === id ? updatedTurf : turf)
          );
          this.isLoading.set(false);
        }),
        catchError(error => {
          this.isLoading.set(false);
          this.error.set('Failed to update turf');
          return throwError(() => error);
        })
      );
  }

  /**
   * Delete turf
   */
  deleteTurf(id: number): Observable<boolean> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.delete(`${this.API_BASE_URL}/turf/${id}`)
      .pipe(
        tap(() => {
          this.turfs.update(turfs => turfs.filter(turf => turf.id !== id));
          this.isLoading.set(false);
        }),
        catchError(error => {
          this.isLoading.set(false);
          this.error.set('Failed to delete turf');
          return throwError(() => error);
        }),
        map(() => true)
      );
  }

  /**
   * Get turfs by sport type
   */
  getTurfsBySportType(sportType: string): Observable<TurfDetail[]> {
    return this.http.get<TurfDetail[]>(`${this.API_BASE_URL}/turf/sport/${sportType}`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to load turfs by sport type');
          return throwError(() => error);
        })
      );
  }

  /**
   * Get turfs by city
   */
  getTurfsByCity(city: string): Observable<TurfDetail[]> {
    return this.http.get<TurfDetail[]>(`${this.API_BASE_URL}/turf/city/${city}`)
      .pipe(
        catchError(error => {
          this.error.set('Failed to load turfs by city');
          return throwError(() => error);
        })
      );
  }

  /**
   * Get turf from local state by ID
   */
  getTurfFromState(id: number): TurfDetail | undefined {
    return this.turfs().find(turf => turf.id === id);
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.error.set(null);
  }

  /**
   * Get available time slots for a specific date
   */
  getAvailableSlots(turf: TurfDetail, date: string): string[] {
    const selectedDay = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const dayTiming = turf.timings.find(t => t.dayOfWeek === selectedDay);

    if (!dayTiming || !dayTiming.isAvailable) {
      return [];
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

    return slots;
  }

  /**
   * Calculate total price for booking
   */
  calculateBookingPrice(turf: TurfDetail, startTime: string, endTime: string): number {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    
    const basePrice = turf.pricePerHour * duration;
    
    // Add amenity costs
    let amenityCost = 0;
    turf.amenities.forEach(amenity => {
      if (amenity.isAvailable && amenity.additionalCost) {
        amenityCost += amenity.additionalCost;
      }
    });
    
    return basePrice + amenityCost;
  }
} 