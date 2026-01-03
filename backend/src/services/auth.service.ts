import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';
import { generateToken } from '../config/auth.js';
import type { User, LoginDto, RegisterDto, AuthResponse, UserResponse } from '../models/User.js';

/**
 * Auth Service
 * Handles user authentication logic
 */
export class AuthService {
    /**
     * Login user
     */
    async login(dto: LoginDto): Promise<AuthResponse | null> {
        const result = await query<User>(
            'SELECT * FROM users WHERE email = $1',
            [dto.email]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(dto.password, user.password_hash);

        if (!validPassword) {
            return null;
        }

        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            user: this.toUserResponse(user),
            token,
        };
    }

    /**
     * Register new user (admin only operation)
     */
    async register(dto: RegisterDto): Promise<AuthResponse | null> {
        // Check if user exists
        const existing = await query(
            'SELECT id FROM users WHERE email = $1',
            [dto.email]
        );

        if (existing.rows.length > 0) {
            return null;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(dto.password, 12);

        // Insert user
        const result = await query<User>(
            `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [dto.email, passwordHash, dto.role || 'user']
        );

        const user = result.rows[0];
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            user: this.toUserResponse(user),
            token,
        };
    }

    /**
     * Get user by ID
     */
    async getUserById(id: string): Promise<UserResponse | null> {
        const result = await query<User>(
            'SELECT * FROM users WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return this.toUserResponse(result.rows[0]);
    }

    /**
     * Convert User to UserResponse (remove password)
     */
    private toUserResponse(user: User): UserResponse {
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
            must_change_password: user.must_change_password || false,
        };
    }

    /**
     * Change user password and clear must_change_password flag
     */
    async changePassword(userId: string, newPassword: string): Promise<void> {
        const passwordHash = await bcrypt.hash(newPassword, 12);
        await query(
            'UPDATE users SET password_hash = $1, must_change_password = false WHERE id = $2',
            [passwordHash, userId]
        );
    }
}

export const authService = new AuthService();
