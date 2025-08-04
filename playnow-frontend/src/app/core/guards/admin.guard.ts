import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated and has admin role
  if (authService.isAuthenticated() && authService.hasRole('Admin')) {
    return true;
  }

  // Redirect to login if not authenticated, or home if not admin
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
  } else {
    router.navigate(['/']);
  }
  return false;
}; 