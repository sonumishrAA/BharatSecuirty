import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { User, LoginDto, AuthResponse } from '@shared/models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly API_URL = `${environment.apiUrl}/auth`;
    private readonly TOKEN_KEY = 'cms_token';
    private readonly USER_KEY = 'cms_user';

    // Signals for reactive state
    private userSignal = signal<User | null>(this.loadUserFromStorage());
    private loadingSignal = signal(false);

    // Public computed signals
    readonly user = computed(() => this.userSignal());
    readonly isAuthenticated = computed(() => !!this.userSignal());
    readonly isAdmin = computed(() => this.userSignal()?.role === 'admin');
    readonly loading = computed(() => this.loadingSignal());

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        // Verify token on init
        this.verifySession();
    }

    /**
     * Login user
     */
    login(dto: LoginDto): Observable<AuthResponse | null> {
        this.loadingSignal.set(true);

        return this.http.post<AuthResponse>(`${this.API_URL}/login`, dto).pipe(
            tap((response) => {
                this.saveSession(response);
                this.loadingSignal.set(false);
            }),
            catchError((error) => {
                this.loadingSignal.set(false);
                console.error('Login failed:', error);
                return of(null);
            })
        );
    }

    /**
     * Logout user
     */
    /**
     * Logout user
     */
    logout(redirect: boolean = true): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.userSignal.set(null);

        if (redirect) {
            this.router.navigate(['/login']);
        }
    }

    /**
     * Get current user from API
     */
    getCurrentUser(): Observable<User | null> {
        return this.http.get<User>(`${this.API_URL}/me`).pipe(
            tap((user) => this.userSignal.set(user)),
            catchError(() => {
                this.logout(false); // Clear session but don't redirect
                return of(null);
            })
        );
    }

    /**
     * Get stored token
     */
    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Verify session on app init
     */
    private verifySession(): void {
        const token = this.getToken();
        if (token) {
            this.getCurrentUser().subscribe();
        }
    }

    /**
     * Save session to storage
     */
    private saveSession(response: AuthResponse): void {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        this.userSignal.set(response.user);
    }

    /**
     * Load user from storage
     */
    private loadUserFromStorage(): User | null {
        const stored = localStorage.getItem(this.USER_KEY);
        return stored ? JSON.parse(stored) : null;
    }
}
