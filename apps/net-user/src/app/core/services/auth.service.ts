import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '@environments';

export interface User {
    id: string;
    email: string;
    role: string;
    must_change_password?: boolean;
}

export interface LoginResponse {
    token: string;
    user: User;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = environment.apiUrl;
    private userSubject = new BehaviorSubject<User | null>(null);
    user$ = this.userSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) {
        this.loadStoredUser();
    }

    private loadStoredUser() {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
            try {
                this.userSubject.next(JSON.parse(userStr));
            } catch { }
        }
    }

    login(email: string, password: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
            tap(res => {
                localStorage.setItem('token', res.token);
                localStorage.setItem('user', JSON.stringify(res.user));
                this.userSubject.next(res.user);
            })
        );
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.userSubject.next(null);
        this.router.navigate(['/login']);
    }

    get isLoggedIn(): boolean {
        return !!localStorage.getItem('token');
    }

    get currentUser(): User | null {
        return this.userSubject.value;
    }

    get token(): string | null {
        return localStorage.getItem('token');
    }

    changePassword(newPassword: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/change-password`, { newPassword }).pipe(
            tap(() => {
                const user = this.currentUser;
                if (user) {
                    user.must_change_password = false;
                    localStorage.setItem('user', JSON.stringify(user));
                    this.userSubject.next(user);
                }
            })
        );
    }
}
