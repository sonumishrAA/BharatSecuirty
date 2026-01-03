/**
 * User Model
 * Matches the database schema for users/profiles tables
 */
export interface User {
    id: string;
    email: string;
    password_hash: string;
    role: UserRole;
    must_change_password?: boolean;
    created_at: Date;
    updated_at: Date;
}

export type UserRole = 'admin' | 'user';

/**
 * Login DTO
 */
export interface LoginDto {
    email: string;
    password: string;
}

/**
 * Register DTO
 */
export interface RegisterDto {
    email: string;
    password: string;
    role?: UserRole;
}

/**
 * User Response (without password)
 */
export interface UserResponse {
    id: string;
    email: string;
    role: UserRole;
    must_change_password?: boolean;
    created_at: Date;
}

/**
 * Auth Response
 */
export interface AuthResponse {
    user: UserResponse;
    token: string;
}
