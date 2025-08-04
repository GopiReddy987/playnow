import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bottom-nav">
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
        <span class="icon">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12L12 3l9 9"/><path d="M9 21V9h6v12"/></svg>
        </span>
        <span class="label">Home</span>
      </a>
      <a routerLink="/sports" routerLinkActive="active" class="nav-item">
        <span class="icon">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 15l4-8 4 8"/></svg>
        </span>
        <span class="label">Sports</span>
      </a>
      <a routerLink="/join-game" routerLinkActive="active" class="nav-item new">
        <span class="icon">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </span>
        <span class="label">Join Now</span>
        <span class="badge">New</span>
      </a>
      <a routerLink="/booking" routerLinkActive="active" class="nav-item">
        <span class="icon">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 3v4M8 3v4"/></svg>
        </span>
        <span class="label">Book</span>
      </a>
      <a routerLink="/login" routerLinkActive="active" class="nav-item">
        <span class="icon">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v2"/></svg>
        </span>
        <span class="label">Login</span>
      </a>
    </nav>
  `,
  styles: [`
    .bottom-nav {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1001;
      background: #fff;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-around;
      align-items: center;
      height: 64px;
      box-shadow: 0 -2px 8px rgba(0,0,0,0.04);
      padding-bottom: env(safe-area-inset-bottom);
    }
    .nav-item {
      flex: 1 1 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #6b7280;
      text-decoration: none;
      font-size: 12px;
      font-weight: 500;
      position: relative;
      transition: color 0.2s;
      padding: 0 2px;
    }
    .nav-item .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2px;
      height: 24px;
    }
    .nav-item.active, .nav-item:active, .nav-item:hover {
      color: #667eea;
    }
    .nav-item .badge {
      position: absolute;
      top: 2px;
      right: 10px;
      background: #ffe066;
      color: #333;
      font-size: 10px;
      font-weight: 700;
      border-radius: 8px;
      padding: 1px 6px;
      margin-left: 2px;
    }
    @media (min-width: 768px) {
      .bottom-nav {
        display: none;
      }
    }
  `]
})
export class BottomNavComponent {} 