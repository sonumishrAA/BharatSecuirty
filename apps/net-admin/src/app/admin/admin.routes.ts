import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/layout.component';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        component: AdminLayoutComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'editor',
                loadComponent: () => import('./pages/editor/editor.component').then(m => m.EditorComponent)
            },
            {
                path: 'editor/:id',
                loadComponent: () => import('./pages/editor/editor.component').then(m => m.EditorComponent)
            },
            {
                path: 'categories',
                loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent)
            },
            {
                path: 'bookings',
                loadComponent: () => import('./pages/bookings/bookings.component').then(m => m.BookingsComponent)
            },
            {
                path: 'services',
                loadComponent: () => import('./pages/services/services.component').then(m => m.ServicesComponent)
            },
            {
                path: 'arsenal',
                loadComponent: () => import('./pages/arsenal/arsenal.component').then(m => m.ArsenalComponent)
            },
            {
                path: 'stats',
                loadComponent: () => import('./pages/stats/stats.component').then(m => m.StatsComponent)
            },
            {
                path: 'case-studies',
                loadComponent: () => import('./pages/case-studies/case-studies.component').then(m => m.CaseStudiesComponent)
            },
            {
                path: 'media',
                loadComponent: () => import('./pages/media/media.component').then(m => m.MediaComponent)
            },
            {
                path: 'users',
                loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent)
            },
            {
                path: 'users/:id',
                loadComponent: () => import('./pages/users/user-detail.component').then(m => m.UserDetailComponent)
            },
            {
                path: 'backend',
                loadComponent: () => import('./pages/system/system.component').then(m => m.SystemComponent)
            }
        ]
    }
];

