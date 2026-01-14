import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/layout.component';

export const ADMIN_ROUTES: Routes = [
    // Preview route WITHOUT layout (clean preview page)
    {
        path: 'preview',
        loadComponent: () => import('./pages/preview/post-preview.component').then(m => m.PostPreviewComponent)
    },
    // Main admin routes with layout
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
                path: 'media',
                loadComponent: () => import('./pages/media/media.component').then(m => m.MediaComponent)
            },
            {
                path: 'subscribers',
                loadComponent: () => import('./pages/subscribers/subscribers.component').then(m => m.SubscribersComponent)
            }
        ]
    }
];
