import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard
 * Protects routes that require authentication
 */
export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;
    }

    // Redirect to login
    router.navigate(['/login']);
    return false;
};

/**
 * Admin Guard
 * Protects routes that require admin role
 */
export const adminGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAdmin()) {
        return true;
    }

    // Redirect to home if authenticated but not admin
    if (authService.isAuthenticated()) {
        router.navigate(['/']);
    } else {
        router.navigate(['/login']);
    }

    return false;
};

/**
 * Guest Guard
 * Redirects authenticated users away from login page
 */
export const guestGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
        return true;
    }

    // Redirect to admin if already logged in
    router.navigate(['/admin']);
    return false;
};
