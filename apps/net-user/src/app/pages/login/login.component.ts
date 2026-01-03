import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
        <div class="login-container">
            <div class="login-card">
                <div class="logo">
                    <h1>🔐 Client Portal</h1>
                    <p>Bharat Security</p>
                </div>
                
                <form (ngSubmit)="login()">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" [(ngModel)]="email" name="email" required placeholder="your@email.com">
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" [(ngModel)]="password" name="password" required placeholder="Your password">
                    </div>
                    
                    @if (error) {
                    <div class="error-message">{{ error }}</div>
                    }
                    
                    <button type="submit" [disabled]="isLoading">
                        {{ isLoading ? 'Logging in...' : 'Login' }}
                    </button>
                </form>
                
                <p class="hint">Use the email and password sent to you after submitting an inquiry.</p>
            </div>
        </div>
    `,
    styles: [`
        .login-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);
            padding: 1rem;
        }
        .login-card {
            background: white;
            padding: 2.5rem;
            border-radius: 1rem;
            width: 100%;
            max-width: 400px;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        }
        .logo {
            text-align: center;
            margin-bottom: 2rem;
            h1 { margin: 0; font-size: 1.5rem; }
            p { margin: 0.5rem 0 0; color: #6b7280; font-size: 0.875rem; }
        }
        .form-group {
            margin-bottom: 1rem;
            label {
                display: block;
                font-size: 0.875rem;
                font-weight: 500;
                margin-bottom: 0.5rem;
                color: #374151;
            }
            input {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 0.5rem;
                font-size: 1rem;
                &:focus {
                    outline: none;
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
                }
            }
        }
        button {
            width: 100%;
            padding: 0.875rem;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 0.5rem;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            margin-top: 1rem;
            &:hover { background: #1d4ed8; }
            &:disabled { background: #93c5fd; cursor: not-allowed; }
        }
        .error-message {
            background: #fee2e2;
            color: #dc2626;
            padding: 0.75rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            margin-top: 1rem;
        }
        .hint {
            text-align: center;
            margin-top: 1.5rem;
            font-size: 0.75rem;
            color: #9ca3af;
        }
    `]
})
export class LoginComponent {
    email = '';
    password = '';
    error = '';
    isLoading = false;

    constructor(private auth: AuthService, private router: Router) { }

    login() {
        this.error = '';
        this.isLoading = true;

        this.auth.login(this.email, this.password).subscribe({
            next: (res) => {
                this.isLoading = false;
                if (res.user.must_change_password) {
                    this.router.navigate(['/change-password']);
                } else {
                    this.router.navigate(['/dashboard']);
                }
            },
            error: (err) => {
                this.isLoading = false;
                this.error = err.error?.error || 'Invalid email or password';
            }
        });
    }
}
