import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Player {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferredSports: string[];
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
  rating: number;
  totalGames: number;
  availability: string[];
  profileImage?: string;
}

export interface OpenMatch {
  id: string;
  title: string;
  sport: string;
  matchType: string;
  date: string;
  time: string;
  duration: string;
  turf: {
    name: string;
    location: string;
    imageUrl: string;
  };
  host: {
    name: string;
    id: string;
    rating: number;
  };
  playersNeeded: number;
  playersJoined: number;
  maxPlayers: number;
  pricePerPlayer: number;
  description: string;
  skillLevel: 'Any' | 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'Open' | 'Full' | 'Cancelled';
  interestedPlayers: string[];
  createdAt: string;
}

export interface PlayerRequest {
  id: string;
  teamName: string;
  sport: string;
  date: string;
  time: string;
  turf: string;
  playersNeeded: number;
  description: string;
  contactInfo: string;
  skillLevel: 'Any' | 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'Active' | 'Filled' | 'Cancelled';
  interestedPlayers: Player[];
  createdAt: string;
}

// Backend DTOs
export interface CreateMatchRequest {
  title: string;
  sport: string;
  matchType: string;
  date: string;
  time: string;
  duration: string;
  maxPlayers: number;
  pricePerPlayer: number;
  skillLevel: string;
  description: string;
  hostPhone: string;
}

export interface MatchResponse {
  id: string;
  title: string;
  sport: string;
  matchType: string;
  date: string;
  time: string;
  duration: string;
  turf: {
    name: string;
    location: string;
    imageUrl: string;
  };
  host: {
    name: string;
    id: string;
    rating: number;
  };
  playersNeeded: number;
  playersJoined: number;
  maxPlayers: number;
  pricePerPlayer: number;
  description: string;
  skillLevel: string;
  status: string;
  interestedPlayers: string[];
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  // Using Angular 17 Signals for reactive state management
  private matches = signal<OpenMatch[]>([]);
  private playerRequests = signal<PlayerRequest[]>([]);
  private isLoading = signal(false);

  private readonly API_BASE_URL = 'http://localhost:5048/api';

  // Computed signals for derived state
  public readonly allMatches = this.matches.asReadonly();
  public readonly allPlayerRequests = this.playerRequests.asReadonly();
  public readonly isLoadingState = this.isLoading.asReadonly();

  public readonly openMatches = computed(() => 
    this.matches().filter(match => match.status === 'Open')
  );

  public readonly activeRequests = computed(() => 
    this.playerRequests().filter(request => request.status === 'Active')
  );

  constructor(private http: HttpClient, private authService: AuthService) {
    // Load initial data
    this.loadMatches();
    this.loadPlayerRequests();
  }

  /**
   * Get HTTP headers with authorization
   */
  private getAuthHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }

  /**
   * Load all matches from backend
   */
  loadMatches(): Observable<MatchResponse[]> {
    this.isLoading.set(true);
    
    return this.http.get<MatchResponse[]>(`${this.API_BASE_URL}/matches`)
      .pipe(
        tap(matches => {
          // Convert backend MatchResponse to frontend OpenMatch
          const convertedMatches: OpenMatch[] = matches.map(match => ({
            id: match.id,
            title: match.title,
            sport: match.sport,
            matchType: match.matchType,
            date: match.date,
            time: match.time,
            duration: match.duration,
            turf: match.turf,
            host: match.host,
            playersNeeded: match.playersNeeded,
            playersJoined: match.playersJoined,
            maxPlayers: match.maxPlayers,
            pricePerPlayer: match.pricePerPlayer,
            description: match.description,
            skillLevel: match.skillLevel as 'Any' | 'Beginner' | 'Intermediate' | 'Advanced',
            status: match.status as 'Open' | 'Full' | 'Cancelled',
            interestedPlayers: match.interestedPlayers,
            createdAt: match.createdAt
          }));
          
          this.matches.set(convertedMatches);
          this.isLoading.set(false);
        }),
        catchError(error => {
          this.isLoading.set(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Load player requests from backend
   */
  loadPlayerRequests(): Observable<PlayerRequest[]> {
    this.isLoading.set(true);
    
    return this.http.get<PlayerRequest[]>(`${this.API_BASE_URL}/player-requests`, {
      headers: this.getAuthHeaders()
    })
      .pipe(
        tap(requests => {
          this.playerRequests.set(requests);
          this.isLoading.set(false);
        }),
        catchError(error => {
          this.isLoading.set(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Create a new match
   */
  createMatch(matchData: CreateMatchRequest): Observable<MatchResponse> {
    this.isLoading.set(true);
    
    return this.http.post<MatchResponse>(`${this.API_BASE_URL}/matches`, matchData, {
      headers: this.getAuthHeaders()
    })
      .pipe(
        tap(response => {
          // Add the new match to the local state
          const newMatch: OpenMatch = {
            id: response.id,
            title: response.title,
            sport: response.sport,
            matchType: response.matchType,
            date: response.date,
            time: response.time,
            duration: response.duration,
            turf: response.turf,
            host: response.host,
            playersNeeded: response.playersNeeded,
            playersJoined: response.playersJoined,
            maxPlayers: response.maxPlayers,
            pricePerPlayer: response.pricePerPlayer,
            description: response.description,
            skillLevel: response.skillLevel as 'Any' | 'Beginner' | 'Intermediate' | 'Advanced',
            status: response.status as 'Open' | 'Full' | 'Cancelled',
            interestedPlayers: response.interestedPlayers,
            createdAt: response.createdAt
          };
          
          this.matches.update(matches => [...matches, newMatch]);
          this.isLoading.set(false);
        }),
        catchError(error => {
          this.isLoading.set(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Join a match
   */
  joinMatch(matchId: string): Observable<any> {
    this.isLoading.set(true);
    
    return this.http.post(`${this.API_BASE_URL}/matches/${matchId}/join`, {}, {
      headers: this.getAuthHeaders()
    })
      .pipe(
        tap(() => {
          // Update local state
          this.matches.update(matches =>
            matches.map(match =>
              match.id === matchId
                ? { 
                    ...match, 
                    playersJoined: match.playersJoined + 1,
                    playersNeeded: Math.max(0, match.playersNeeded - 1),
                    status: match.playersJoined + 1 >= match.maxPlayers ? 'Full' : 'Open'
                  }
                : match
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
   * Get match by ID
   */
  getMatchById(matchId: string): Observable<MatchResponse> {
    return this.http.get<MatchResponse>(`${this.API_BASE_URL}/matches/${matchId}`, {
      headers: this.getAuthHeaders()
    })
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  /**
   * Cancel a match
   */
  cancelMatch(matchId: string): Observable<any> {
    this.isLoading.set(true);
    
    return this.http.post(`${this.API_BASE_URL}/matches/${matchId}/cancel`, {}, {
      headers: this.getAuthHeaders()
    })
      .pipe(
        tap(() => {
          // Update local state
          this.matches.update(matches =>
            matches.map(match =>
              match.id === matchId
                ? { ...match, status: 'Cancelled' as const }
                : match
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
   * Search matches with filters
   */
  searchMatches(filters: {
    sport?: string;
    date?: string;
    skillLevel?: string;
    searchQuery?: string;
  }): Observable<MatchResponse[]> {
    this.isLoading.set(true);
    
    let url = `${this.API_BASE_URL}/matches/search`;
    const params: string[] = [];
    
    if (filters.sport) params.push(`sport=${filters.sport}`);
    if (filters.date) params.push(`date=${filters.date}`);
    if (filters.skillLevel) params.push(`skillLevel=${filters.skillLevel}`);
    if (filters.searchQuery) params.push(`search=${filters.searchQuery}`);
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<MatchResponse[]>(url, {
      headers: this.getAuthHeaders()
    })
      .pipe(
        tap(matches => {
          // Convert and update local state
          const convertedMatches: OpenMatch[] = matches.map(match => ({
            id: match.id,
            title: match.title,
            sport: match.sport,
            matchType: match.matchType,
            date: match.date,
            time: match.time,
            duration: match.duration,
            turf: match.turf,
            host: match.host,
            playersNeeded: match.playersNeeded,
            playersJoined: match.playersJoined,
            maxPlayers: match.maxPlayers,
            pricePerPlayer: match.pricePerPlayer,
            description: match.description,
            skillLevel: match.skillLevel as 'Any' | 'Beginner' | 'Intermediate' | 'Advanced',
            status: match.status as 'Open' | 'Full' | 'Cancelled',
            interestedPlayers: match.interestedPlayers,
            createdAt: match.createdAt
          }));
          
          this.matches.set(convertedMatches);
          this.isLoading.set(false);
        }),
        catchError(error => {
          this.isLoading.set(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get matches for a specific date
   */
  getMatchesForDate(date: string): OpenMatch[] {
    return this.matches().filter(match => match.date === date);
  }

  /**
   * Get matches for a specific sport
   */
  getMatchesForSport(sport: string): OpenMatch[] {
    return this.matches().filter(match => match.sport === sport);
  }

  /**
   * Get user's hosted matches
   */
  getUserHostedMatches(): OpenMatch[] {
    const currentUser = this.authService.getUser();
    if (!currentUser) return [];
    
    return this.matches().filter(match => match.host.id === currentUser.id);
  }

  /**
   * Get user's joined matches
   */
  getUserJoinedMatches(): OpenMatch[] {
    const currentUser = this.authService.getUser();
    if (!currentUser) return [];
    
    return this.matches().filter(match => 
      match.interestedPlayers.includes(currentUser.id)
    );
  }
} 