import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <div class="navbar-brand">
          <a routerLink="/" class="brand-link">
            <img src="/assets/images/avatars/playnowlogo.png" alt="PlayNow Logo" class="brand-logo" />
            <span class="brand-text">PlayNow</span>
          </a>
        </div>

        <div class="navbar-menu" [class.active]="isMenuOpen()" *ngIf="!isAdminRouteActive">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
            Home
          </a>
          <a routerLink="/sports" routerLinkActive="active" class="nav-link">
            Sports
          </a>
          <a routerLink="/join-game" routerLinkActive="active" class="nav-link">
            🔥 Join Game
          </a>
          <a routerLink="/booking" routerLinkActive="active" class="nav-link">
            Book Turf
          </a>
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
            Dashboard
          </a>
        </div>

        <div class="navbar-actions">
          <!-- User Profile (when logged in) -->
          <div class="user-profile" *ngIf="authService.isAuthenticated()">
            <div class="user-info" (click)="toggleUserMenu()">
              <img 
                [src]="authService.currentUser()?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'" 
                [alt]="authService.currentUser()?.name"
                class="user-avatar"
              >
              <span class="user-name">{{ authService.currentUser()?.name }}</span>
              <span class="dropdown-arrow">▼</span>
            </div>
            
            <div class="user-menu" [class.active]="isUserMenuOpen()">
              <div class="menu-item" (click)="goToProfile()">
                👤 Profile
              </div>
              <div class="menu-item" (click)="goToSettings()">
                ⚙️ Settings
              </div>
              <div class="menu-item" *ngIf="authService.hasRole('Admin')" (click)="goToAdmin()">
                🏢 Admin Portal
              </div>
              <div class="menu-divider"></div>
              <div class="menu-item logout" (click)="logout()">
                🚪 Logout
              </div>
            </div>
          </div>

          <!-- Login/Register buttons (when not logged in) -->
          <div class="auth-buttons" *ngIf="!authService.isAuthenticated()">
            <button class="btn btn-secondary" (click)="goToLogin()">
              Login
            </button>
            <button class="btn btn-primary" (click)="goToRegister()">
              Sign Up
            </button>
          </div>

          <button class="mobile-menu-toggle" (click)="toggleMenu()">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .navbar-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 70px;
    }

    .navbar-brand {
      flex-shrink: 0;
    }

    .brand-link {
      text-decoration: none;
      color: inherit;
    }

    .brand-text {
      font-size: 1.5rem;
      font-weight: bold;
      color: #667eea;
    }

    .navbar-menu {
      display: flex;
      gap: 2rem;
      align-items: center;
    }

    .nav-link {
      text-decoration: none;
      color: #333;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      transition: all 0.3s ease;
    }

    .nav-link:hover {
      background: #f8f9fa;
      color: #667eea;
    }

    .nav-link.active {
      background: #667eea;
      color: white;
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .auth-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .btn {
      padding: 0.5rem 1.5rem;
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

    .btn-primary:hover {
      background: #5a6fd8;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: transparent;
      color: #667eea;
      border: 1px solid #667eea;
    }

    .btn-secondary:hover {
      background: #667eea;
      color: white;
      transform: translateY(-1px);
    }

    .user-profile {
      position: relative;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    .user-info:hover {
      background: #f8f9fa;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-name {
      font-weight: 500;
      color: #333;
    }

    .dropdown-arrow {
      font-size: 0.75rem;
      color: #666;
      transition: transform 0.2s;
    }

    .user-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      min-width: 180px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.2s;
      z-index: 1000;
    }

    .user-menu.active {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .menu-item {
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: background 0.2s;
      border-radius: 0.25rem;
      margin: 0.25rem;
    }

    .menu-item:hover {
      background: #f8f9fa;
    }

    .menu-item.logout {
      color: #e53e3e;
    }

    .menu-item.logout:hover {
      background: #fed7d7;
    }

    .menu-divider {
      height: 1px;
      background: #e2e8f0;
      margin: 0.5rem 0;
    }

    .mobile-menu-toggle {
      display: none;
      flex-direction: column;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
    }

    .mobile-menu-toggle span {
      width: 25px;
      height: 3px;
      background: #333;
      margin: 3px 0;
      transition: 0.3s;
      border-radius: 2px;
    }

    @media (max-width: 768px) {
      .navbar-menu {
        position: absolute;
        top: 70px;
        left: 0;
        right: 0;
        background: white;
        flex-direction: column;
        padding: 1rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transform: translateY(-100%);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }

      .navbar-menu.active {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
      }

      .mobile-menu-toggle {
        display: flex;
      }

      .navbar-container {
        padding: 0 1rem;
      }

      .user-name {
        display: none;
      }

      .auth-buttons {
        display: none;
      }
    }

    .brand-logo {
      height: 32px;
      width: 32px;
      margin-right: 0.5rem;
      vertical-align: middle;
      border-radius: 8px;
      object-fit: contain;
    }
  `]
})
export class NavbarComponent {
  isMenuOpen = signal(false);
  isUserMenuOpen = signal(false);
  isAdminRouteActive = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event) => {
      this.isAdminRouteActive = this.router.url.startsWith('/admin');
    });
    // Set initial value
    this.isAdminRouteActive = this.router.url.startsWith('/admin');
  }

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  toggleUserMenu() {
    this.isUserMenuOpen.set(!this.isUserMenuOpen());
  }

  goToLogin() {
    this.router.navigate(['/login']);
    this.isUserMenuOpen.set(false);
  }

  goToRegister() {
    this.router.navigate(['/register']);
    this.isUserMenuOpen.set(false);
  }

  goToProfile() {
    this.router.navigate(['/dashboard']);
    this.isUserMenuOpen.set(false);
  }

  goToSettings() {
    // TODO: Implement settings page
    console.log('Go to settings');
    this.isUserMenuOpen.set(false);
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
    this.isUserMenuOpen.set(false);
  }

  logout() {
    this.authService.logout();
    this.isUserMenuOpen.set(false);
  }
} 