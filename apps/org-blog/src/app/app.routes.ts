import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    // ===== PUBLIC ROUTES =====
    {
        path: '',
        loadChildren: () => import('./public/public.routes').then(m => m.PUBLIC_ROUTES)
    },

    // ===== AUTH ROUTES =====
    {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
    },

    // ===== ADMIN ROUTES =====
    {
        path: 'admin',
        canActivate: [authGuard, adminGuard],
        loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
    },

    // ===== 404 NOT FOUND =====
    {
        path: '**',
        loadComponent: () => import('./public/pages/not-found/not-found.component').then(m => m.NotFoundComponent)
    }
];
