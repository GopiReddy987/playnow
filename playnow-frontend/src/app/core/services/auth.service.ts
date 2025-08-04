import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  lastName?: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    profilePictureUrl?: string;
    dateOfBirth: string;
    address?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // User state using signals
  currentUser = signal<User | null>(null);
  isAuthenticated = signal(false);
  isLoading = signal(false);
  token = signal<string | null>(null);

  private platformId = inject(PLATFORM_ID);
  private readonly API_BASE_URL = 'http://localhost:5048/api';

  constructor(private router: Router, private http: HttpClient) {
    // Check if user is logged in on app start (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      this.checkAuthStatus();
    }
  }

  /**
   * Check if user is authenticated (from localStorage)
   */
  private checkAuthStatus(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const userData = localStorage.getItem('playnow_user');
    const token = localStorage.getItem('playnow_token');
    
    if (userData && token) {
      try {
        const user = JSON.parse(userData);
        this.currentUser.set(user);
        this.token.set(token);
        this.isAuthenticated.set(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.logout();
      }
    }
  }

  /**
   * Get HTTP headers with authorization token
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.token();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  /**
   * Login user
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.isLoading.set(true);
    
    return this.http.post<AuthResponse>(`${this.API_BASE_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.handleAuthSuccess(response);
          this.isLoading.set(false);
        }),
        catchError(error => {
          this.isLoading.set(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Register new user
   */
  register(userData: RegisterData): Observable<AuthResponse> {
    this.isLoading.set(true);

    // Map frontend RegisterData to backend RegisterRequest
    const payload = {
      email: userData.email,
      password: userData.password,
      firstName: userData.name,
      lastName: userData.lastName || '',
      phoneNumber: userData.phone || ''
    };

    console.log('Making register request to:', `${this.API_BASE_URL}/auth/register`);
    console.log('Payload:', payload);

    return this.http.post<AuthResponse>(`${this.API_BASE_URL}/auth/register`, payload)
      .pipe(
        tap(response => {
          console.log('Register response:', response);
          this.handleAuthSuccess(response);
          this.isLoading.set(false);
        }),
        catchError(error => {
          console.error('Register error:', error);
          this.isLoading.set(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(response: AuthResponse): void {
    const user: User = {
      id: response.user.id,
      name: `${response.user.firstName} ${response.user.lastName}`.trim(),
      email: response.user.email,
      phone: response.user.phoneNumber || '',
      avatar: response.user.profilePictureUrl
    };

    this.currentUser.set(user);
    this.token.set(response.token);
    this.isAuthenticated.set(true);
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('playnow_user', JSON.stringify(user));
      localStorage.setItem('playnow_token', response.token);
      localStorage.setItem('playnow_refresh_token', response.refreshToken);
    }
  }

  /**
   * Refresh token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('playnow_refresh_token');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${this.API_BASE_URL}/auth/refresh-token`, { refreshToken })
      .pipe(
        tap(response => {
          this.handleAuthSuccess(response);
        }),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  /**
   * Logout user
   */
  logout(): void {
    const refreshToken = localStorage.getItem('playnow_refresh_token');
    
    // Revoke token on backend
    if (refreshToken) {
      this.http.post(`${this.API_BASE_URL}/auth/revoke-token`, { refreshToken })
        .subscribe({
          error: (error) => console.error('Error revoking token:', error)
        });
    }

    this.currentUser.set(null);
    this.token.set(null);
    this.isAuthenticated.set(false);
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('playnow_user');
      localStorage.removeItem('playnow_token');
      localStorage.removeItem('playnow_refresh_token');
    }
    
    this.router.navigate(['/login']);
  }

  /**
   * Get current user
   */
  getUser(): User | null {
    return this.currentUser();
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string): boolean {
    const user = this.currentUser();
    if (!user) return false;
    
    // For now, we'll check if the user has admin role
    // In a real implementation, you'd decode the JWT token to get roles
    // or store roles in the user object
    return user.email === 'admin@playnow.com' || role === 'User';
  }

  /**
   * Update user profile
   */
  updateProfile(updates: Partial<User>): void {
    const currentUser = this.currentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      this.currentUser.set(updatedUser);
      
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('playnow_user', JSON.stringify(updatedUser));
      }
    }
  }

  /**
   * Forgot password
   */
  forgotPassword(email: string): Promise<boolean> {
    this.isLoading.set(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock password reset - replace with real API call
        console.log('Password reset email sent to:', email);
        this.isLoading.set(false);
        resolve(true);
      }, 2000); // Simulate API delay
    });
  }

  /**
   * Send OTP to mobile
   */
  sendOtp(phone: string): Observable<any> {
    this.isLoading.set(true);
    return this.http.post(`${this.API_BASE_URL}/auth/send-otp`, phone, { responseType: 'text' })
      .pipe(
        tap(() => {
          this.isLoading.set(false);
        }),
        catchError(error => {
          this.isLoading.set(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Verify OTP
   */
  verifyOtp(phone: string, otp: string): Observable<any> {
    this.isLoading.set(true);
    return this.http.post(`${this.API_BASE_URL}/auth/verify-otp`, { phone, otp })
      .pipe(
        tap(() => {
          this.isLoading.set(false);
        }),
        catchError(error => {
          this.isLoading.set(false);
          return throwError(() => error);
        })
      );
  }

} 