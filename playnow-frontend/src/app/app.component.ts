import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { BottomNavComponent } from './shared/bottom-nav/bottom-nav.component';
import { MobileHeaderComponent } from './shared/mobile-header/mobile-header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, BottomNavComponent, MobileHeaderComponent],
  template: `
    <app-navbar class="hide-on-mobile"></app-navbar>
    <app-mobile-header class="show-on-mobile"></app-mobile-header>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <app-footer class="hide-on-mobile"></app-footer>
    <app-bottom-nav class="show-on-mobile"></app-bottom-nav>
  `,
  styles: [`
    .main-content {
      min-height: calc(100vh - 70px);
      background: #f8f9fa;
    }
    .hide-on-mobile {
      display: block;
    }
    .show-on-mobile {
      display: none;
    }
    @media (max-width: 767px) {
      .hide-on-mobile {
        display: none !important;
      }
      .show-on-mobile {
        display: block !important;
      }
      .main-content {
        min-height: calc(100vh - 120px);
      }
    }
  `]
})
export class AppComponent {
  title = 'playnow-frontend';
}
