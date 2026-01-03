import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.scss'
})
export class AdminLayoutComponent {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    logout(): void {
        this.authService.logout();
    }
}
