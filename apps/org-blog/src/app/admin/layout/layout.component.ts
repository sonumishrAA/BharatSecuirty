import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.scss'
})
export class AdminLayoutComponent {
    isEditorRoute = false;

    constructor(
        private authService: AuthService,
        private router: Router
    ) {
        // Check if we're on the editor route
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: any) => {
            this.isEditorRoute = event.url.includes('/admin/editor');
        });

        // Check initial route
        this.isEditorRoute = this.router.url.includes('/admin/editor');
    }

    logout(): void {
        this.authService.logout();
    }
}
