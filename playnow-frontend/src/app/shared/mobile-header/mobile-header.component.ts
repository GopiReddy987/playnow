import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mobile-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="mobile-header">
      <div class="logo-section">
        <img src="/assets/images/avatars/playnowlogo.png" alt="PlayNow Logo" class="logo" />
        <span class="brand">Play<span class="brand-now">Now</span></span>
      </div>
      <button class="location-btn">
        <svg class="location-icon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="7"/><path d="M9 6v3l2 2"/></svg>
        <span class="city">Hyderabad</span>
      </button>
    </header>
  `,
  styles: [`
    .mobile-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem 0.75rem 1rem;
      background: #fff;
      border-bottom: 1px solid #e5e7eb;
      height: 56px;
      position: sticky;
      top: 0;
      z-index: 1002;
    }
    .logo-section {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .logo {
      width: 32px;
      height: 32px;
      border-radius: 6px;
    }
    .brand {
      font-size: 1.4rem;
      font-weight: 700;
      color: #22b573;
      letter-spacing: 1px;
    }
    .brand-now {
      color: #667eea;
      font-family: inherit;
      font-weight: 700;
      font-size: 1.4rem;
      margin-left: 2px;
    }
    .location-btn {
      display: flex;
      align-items: center;
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 999px;
      padding: 0.35rem 1rem 0.35rem 0.7rem;
      font-size: 1rem;
      color: #374151;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
      outline: none;
      box-shadow: none;
    }
    .location-btn:hover {
      background: #e5e7eb;
    }
    .location-icon {
      margin-right: 0.5rem;
      color: #6b7280;
    }
    .city {
      font-size: 1rem;
      color: #374151;
      font-weight: 500;
    }
    @media (min-width: 768px) {
      .mobile-header {
        display: none;
      }
    }
  `]
})
export class MobileHeaderComponent {} 