/**
 * User Model
 */
export interface User {
    id: string;
    email: string;
    role: UserRole;
    created_at: string;
}

export type UserRole = 'admin' | 'user';

/**
 * Login Request DTO
 */
export interface LoginDto {
    email: string;
    password: string;
}

/**
 * Auth Response
 */
export interface AuthResponse {
    user: User;
    token: string;
}
