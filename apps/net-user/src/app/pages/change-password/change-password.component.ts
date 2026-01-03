import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
        <div class="change-password-container">
            <div class="card">
                <h2>🔑 Change Password</h2>
                <p class="subtitle">You must set a new password before continuing.</p>
                
                <form (ngSubmit)="changePassword()">
                    <div class="form-group">
                        <label>New Password</label>
                        <input type="password" [(ngModel)]="newPassword" name="newPassword" required 
                            placeholder="At least 8 characters" minlength="8">
                    </div>
                    <div class="form-group">
                        <label>Confirm Password</label>
                        <input type="password" [(ngModel)]="confirmPassword" name="confirmPassword" required 
                            placeholder="Repeat your password">
                    </div>
                    
                    @if (error) {
                    <div class="error-message">{{ error }}</div>
                    }
                    
                    <button type="submit" [disabled]="isLoading">
                        {{ isLoading ? 'Updating...' : 'Set New Password' }}
                    </button>
                </form>
            </div>
        </div>
    `,
    styles: [`
        .change-password-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);
            padding: 1rem;
        }
        .card {
            background: white;
            padding: 2.5rem;
            border-radius: 1rem;
            width: 100%;
            max-width: 400px;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
            h2 { margin: 0 0 0.5rem; }
            .subtitle { color: #6b7280; margin: 0 0 2rem; }
        }
        .form-group {
            margin-bottom: 1rem;
            label { display: block; font-weight: 500; margin-bottom: 0.5rem; }
            input {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 0.5rem;
                &:focus { outline: none; border-color: #2563eb; }
            }
        }
        button {
            width: 100%;
            padding: 0.875rem;
            background: #16a34a;
            color: white;
            border: none;
            border-radius: 0.5rem;
            font-weight: 500;
            cursor: pointer;
            margin-top: 1rem;
            &:hover { background: #15803d; }
            &:disabled { background: #86efac; cursor: not-allowed; }
        }
        .error-message {
            background: #fee2e2;
            color: #dc2626;
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-top: 1rem;
        }
    `]
})
export class ChangePasswordComponent {
    newPassword = '';
    confirmPassword = '';
    error = '';
    isLoading = false;

    constructor(private auth: AuthService, private router: Router) { }

    changePassword() {
        this.error = '';

        if (this.newPassword.length < 8) {
            this.error = 'Password must be at least 8 characters';
            return;
        }

        if (this.newPassword !== this.confirmPassword) {
            this.error = 'Passwords do not match';
            return;
        }

        this.isLoading = true;
        this.auth.changePassword(this.newPassword).subscribe({
            next: () => {
                this.isLoading = false;
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.isLoading = false;
                this.error = err.error?.error || 'Failed to change password';
            }
        });
    }
}
