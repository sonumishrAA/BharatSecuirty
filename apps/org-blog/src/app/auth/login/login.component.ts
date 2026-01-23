import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
    email = '';
    password = '';
    loading = signal(false);
    error = signal('');

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        // Auto-logout when visiting login page
        this.authService.logout();
    }

    onSubmit(): void {
        this.error.set('');
        this.loading.set(true);

        this.authService.login({ email: this.email, password: this.password })
            .subscribe({
                next: (response) => {
                    this.loading.set(false);
                    if (response) {
                        this.router.navigate(['/admin']);
                    } else {
                        this.error.set('Invalid email or password');
                    }
                },
                error: (err) => {
                    this.loading.set(false);
                    this.error.set(err.error?.message || 'Login failed');
                }
            });
    }
}
