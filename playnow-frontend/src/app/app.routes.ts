import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) 
  },
  { 
    path: 'sports', 
    loadComponent: () => import('./features/sports/sports.component').then(m => m.SportsComponent) 
  },
  { 
    path: 'join-game', 
    loadComponent: () => import('./features/join-game/join-game.component').then(m => m.JoinGameComponent) 
  },
  { 
    path: 'live-match/:matchId', 
    loadComponent: () => import('./features/live-match/live-match.component').then(m => m.LiveMatchComponent) 
  },
  { 
    path: 'pool', 
    loadComponent: () => import('./features/pool/pool.component').then(m => m.PoolComponent) 
  },
  { 
    path: 'booking', 
    loadComponent: () => import('./features/booking/booking.component').then(m => m.BookingComponent) 
  },
  { 
    path: 'booking/:sportId', 
    loadComponent: () => import('./features/booking/booking.component').then(m => m.BookingComponent) 
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) 
  },
  { 
    path: 'team', 
    loadComponent: () => import('./features/team/team.component').then(m => m.TeamComponent) 
  },
  { 
    path: 'turf', 
    loadComponent: () => import('./features/turf/turf.component').then(m => m.TurfComponent) 
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/ground-management',
    loadComponent: () => import('./features/admin/ground-management/ground-management.component').then(m => m.GroundManagementComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./features/admin/users/users.component').then(m => m.UsersComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/bookings',
    loadComponent: () => import('./features/admin/bookings/bookings.component').then(m => m.BookingsComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'book-turf',
    loadComponent: () => import('./features/book-turf/book-turf.component').then(m => m.BookTurfComponent)
  },
  {
    path: 'join-player/:matchId/:spotNumber',
    loadComponent: () => import('./features/join-player/join-player.component').then(m => m.JoinPlayerComponent)
  },
  {
    path: 'payment/:matchId/:playerId',
    loadComponent: () => import('./features/payment/payment.component').then(m => m.PaymentComponent)
  },
  {
    path: 'book-ground/:id',
    loadComponent: () => import('./features/ground-booking/ground-booking.component').then(m => m.GroundBookingComponent)
  },
  {
    path: 'match-setup',
    loadComponent: () => import('./features/match-setup/match-setup.component').then(m => m.MatchSetupComponent)
  },
  {
    path: 'match-summary/:matchId',
    loadComponent: () => import('./features/match-summary/match-summary.component').then(m => m.MatchSummaryComponent)
  },
  {
    path: 'test-cors',
    loadComponent: () => import('./features/test-cors/test-cors.component').then(m => m.TestCorsComponent)
  },
  {
    path: 'match-details/:id',
    loadComponent: () => import('./features/match-details/match-details.component').then(m => m.MatchDetailsComponent)
  }
];
