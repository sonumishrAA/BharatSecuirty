import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layout/layout.component';

export const PUBLIC_ROUTES: Routes = [
    {
        path: '',
        component: PublicLayoutComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
            },
            {
                path: 'blog',
                loadComponent: () => import('./pages/posts-list/posts-list.component').then(m => m.PostsListComponent),
                data: { type: 'blog' }
            },
            {
                path: 'osint',
                loadComponent: () => import('./pages/posts-list/posts-list.component').then(m => m.PostsListComponent),
                data: { type: 'osint' }
            },
            {
                path: 'scam-alert',
                loadComponent: () => import('./pages/posts-list/posts-list.component').then(m => m.PostsListComponent),
                data: { type: 'scam' }
            },
            {
                path: 'resources',
                loadComponent: () => import('./pages/posts-list/posts-list.component').then(m => m.PostsListComponent),
                data: { type: 'resources' }
            },
            {
                path: 'blog/:slug',
                loadComponent: () => import('./pages/post-view/post-view.component').then(m => m.PostViewComponent)
            },
            {
                path: 'about',
                loadComponent: () => import('./pages/static/about.component').then(m => m.AboutComponent)
            },
            {
                path: 'privacy-policy',
                loadComponent: () => import('./pages/static/privacy.component').then(m => m.PrivacyComponent)
            },
            {
                path: 'terms',
                loadComponent: () => import('./pages/static/terms.component').then(m => m.TermsComponent)
            },
            {
                path: 'contact',
                loadComponent: () => import('./pages/static/contact.component').then(m => m.ContactComponent)
            }
        ]
    }
];
