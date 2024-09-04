import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if the user is authenticated by verifying the presence of a valid token
  if (authService.isAuthenticated()) {
    return true;
  } else {
    // Redirect to the login or home page if not authenticated
    router.navigate(['/login']);
    return false;
  }
};
