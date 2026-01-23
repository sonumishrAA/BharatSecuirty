import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { BusinessService, CreateBusinessServiceDto, UpdateBusinessServiceDto } from '../models/BusinessService.js';
import { BusinessBooking, CreateBookingDto } from '../models/BusinessBooking.js';
import { BusinessClient, CreateBusinessClientDto } from '../models/BusinessClient.js';
import { BusinessTestimonial, CreateBusinessTestimonialDto } from '../models/BusinessTestimonial.js';
import { BusinessStat, CreateBusinessStatDto, UpdateBusinessStatDto } from '../models/BusinessStat.js';
import { CaseStudy, CreateCaseStudyDto, UpdateCaseStudyDto } from '../models/CaseStudy.js';

export class BusinessServiceManager {

    // ==========================================
    // SERVICES
    // ==========================================
    async getAllServices(): Promise<BusinessService[]> {
        const result = await query<BusinessService>('SELECT * FROM business_services ORDER BY created_at DESC');
        return result.rows;
    }

    async getServiceBySlug(slug: string): Promise<BusinessService | null> {
        const result = await query<BusinessService>('SELECT * FROM business_services WHERE slug = $1', [slug]);
        return result.rows[0] || null;
    }

    async createService(dto: CreateBusinessServiceDto): Promise<BusinessService> {
        const id = uuidv4();
        const slug = dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const result = await query<BusinessService>(
            `INSERT INTO business_services (id, title, slug, description, features, icon, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [id, dto.title, slug, dto.description, JSON.stringify(dto.features || []), dto.icon, dto.status || 'active']
        );
        return result.rows[0];
    }

    async updateService(id: string, dto: UpdateBusinessServiceDto): Promise<BusinessService | null> {
        const slug = dto.title ? dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined;

        const result = await query<BusinessService>(
            `UPDATE business_services 
             SET title = COALESCE($1, title), 
                 slug = COALESCE($2, slug),
                 description = COALESCE($3, description), 
                 features = COALESCE($4, features), 
                 icon = COALESCE($5, icon), 
                 status = COALESCE($6, status)
             WHERE id = $7 RETURNING *`,
            [dto.title, slug, dto.description, dto.features ? JSON.stringify(dto.features) : null, dto.icon, dto.status, id]
        );
        return result.rows[0] || null;
    }

    // ==========================================
    // BOOKINGS & AUTH AUTOMATION
    // ==========================================
    async createBooking(dto: CreateBookingDto): Promise<{ booking: BusinessBooking, user: User, isNewUser: boolean, tempPassword?: string }> {
        // 0. Check for duplicate pending booking with same email
        const existingBooking = await query<BusinessBooking>(
            `SELECT id FROM business_bookings WHERE contact_email = $1 AND status IN ('pending', 'in_progress') LIMIT 1`,
            [dto.contact_email]
        );
        if (existingBooking.rows.length > 0) {
            throw new Error('DUPLICATE_EMAIL: You already have a pending request. Please wait for our team to respond.');
        }

        // 1. Check if user exists
        let userResult = await query<User>('SELECT * FROM users WHERE email = $1', [dto.contact_email]);
        let user = userResult.rows[0];
        let isNewUser = false;
        let tempPassword = undefined;

        // 2. Auto-create user if not exists
        if (!user) {
            isNewUser = true;
            tempPassword = Math.random().toString(36).slice(-8) + "Az1!"; // Simple random password
            const passwordHash = await bcrypt.hash(tempPassword, 12);
            const userId = uuidv4();

            userResult = await query<User>(
                `INSERT INTO users (id, email, password_hash, role, must_change_password) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [userId, dto.contact_email, passwordHash, 'user', true]
            );
            user = userResult.rows[0];
        }

        // 3. Create Booking with all form fields
        const bookingId = uuidv4();
        const bookingResult = await query<BusinessBooking>(
            `INSERT INTO business_bookings (
                id, service_id, user_id, contact_name, contact_email, message, attachment_url, temp_password,
                company, phone, service_type, additional_info
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [
                bookingId, dto.service_id, user.id, dto.contact_name, dto.contact_email, dto.message, dto.attachment_url, tempPassword || null,
                dto.company || null, dto.phone || null, dto.service_type || null, dto.additional_info || null
            ]
        );

        return {
            booking: bookingResult.rows[0],
            user,
            isNewUser,
            tempPassword
        };
    }

    async getBookings(): Promise<BusinessBooking[]> {
        const result = await query<BusinessBooking>(`
            SELECT b.*, s.title as service_title 
            FROM business_bookings b
            LEFT JOIN business_services s ON b.service_id = s.id
            ORDER BY b.created_at DESC
        `);
        return result.rows;
    }

    async deleteBooking(id: string): Promise<void> {
        // Get user_id before deleting booking
        const bookingResult = await query<BusinessBooking>('SELECT user_id FROM business_bookings WHERE id = $1', [id]);
        const booking = bookingResult.rows[0];

        // Delete booking first
        await query('DELETE FROM business_bookings WHERE id = $1', [id]);

        // Delete user if they have no other bookings (invalidates their JWT)
        if (booking?.user_id) {
            const otherBookings = await query('SELECT id FROM business_bookings WHERE user_id = $1 LIMIT 1', [booking.user_id]);
            if (otherBookings.rows.length === 0) {
                await query('DELETE FROM users WHERE id = $1 AND role = $2', [booking.user_id, 'user']);
            }
        }
    }

    async bulkDeleteBookings(ids: string[]): Promise<void> {
        if (ids.length === 0) return;

        // Get user_ids before deleting
        const bookingsResult = await query<BusinessBooking>('SELECT DISTINCT user_id FROM business_bookings WHERE id = ANY($1)', [ids]);
        const userIds = bookingsResult.rows.map(b => b.user_id).filter(Boolean);

        // Delete bookings
        await query('DELETE FROM business_bookings WHERE id = ANY($1)', [ids]);

        // Delete users who have no remaining bookings
        for (const userId of userIds) {
            const otherBookings = await query('SELECT id FROM business_bookings WHERE user_id = $1 LIMIT 1', [userId]);
            if (otherBookings.rows.length === 0) {
                await query('DELETE FROM users WHERE id = $1 AND role = $2', [userId, 'user']);
            }
        }
    }

    async deleteUser(userId: string): Promise<void> {
        // Cascade delete will handle bookings if configured, but let's be explicit
        await query('DELETE FROM business_bookings WHERE user_id = $1', [userId]);
        await query('DELETE FROM users WHERE id = $1', [userId]);
    }

    async updateUserCredentials(userId: string, email?: string, password?: string): Promise<void> {
        if (email) {
            await query('UPDATE users SET email = $1 WHERE id = $2', [email, userId]);
            // Also update contact_email in bookings for consistency
            await query('UPDATE business_bookings SET contact_email = $1 WHERE user_id = $2', [email, userId]);
        }

        if (password) {
            const passwordHash = await bcrypt.hash(password, 12);
            await query('UPDATE users SET password_hash = $1, must_change_password = false WHERE id = $2', [passwordHash, userId]);
            // Sync temp_password in business_bookings so Admin sees the new password
            await query('UPDATE business_bookings SET temp_password = $1 WHERE user_id = $2', [password, userId]);
        }
    }

    // ==========================================
    // CLIENTS & TESTIMONIALS
    // ==========================================
    async getClients(): Promise<BusinessClient[]> {
        const result = await query<BusinessClient>('SELECT * FROM business_clients ORDER BY created_at DESC');
        return result.rows;
    }

    async createClient(dto: CreateBusinessClientDto): Promise<BusinessClient> {
        const id = uuidv4();
        const result = await query<BusinessClient>(
            'INSERT INTO business_clients (id, name, logo_url, website_url) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, dto.name, dto.logo_url, dto.website_url]
        );
        return result.rows[0];
    }

    async getTestimonials(): Promise<BusinessTestimonial[]> {
        const result = await query<BusinessTestimonial>('SELECT * FROM business_testimonials ORDER BY created_at DESC');
        return result.rows;
    }

    async createTestimonial(dto: CreateBusinessTestimonialDto): Promise<BusinessTestimonial> {
        const id = uuidv4();
        const result = await query<BusinessTestimonial>(
            'INSERT INTO business_testimonials (id, client_name, company, content, rating, avatar_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [id, dto.client_name, dto.company, dto.content, dto.rating || 5, dto.avatar_url]
        );
        return result.rows[0];
    }

    async updateTestimonial(id: string, dto: CreateBusinessTestimonialDto): Promise<BusinessTestimonial | null> {
        const result = await query<BusinessTestimonial>(
            `UPDATE business_testimonials 
             SET client_name = COALESCE($1, client_name), 
                 company = COALESCE($2, company),
                 content = COALESCE($3, content), 
                 rating = COALESCE($4, rating), 
                 avatar_url = COALESCE($5, avatar_url),
                 updated_at = NOW()
             WHERE id = $6 RETURNING *`,
            [dto.client_name, dto.company, dto.content, dto.rating, dto.avatar_url, id]
        );
        return result.rows[0] || null;
    }

    async deleteTestimonial(id: string): Promise<void> {
        await query('DELETE FROM business_testimonials WHERE id = $1', [id]);
    }

    // ==========================================
    // USERS MANAGEMENT
    // ==========================================
    async getAllClientUsers(): Promise<any[]> {
        const result = await query(`
            SELECT u.id, u.email, u.role, u.must_change_password, u.created_at,
                   COUNT(b.id) as booking_count,
                   MAX(b.contact_name) as name,
                   MAX(b.company) as company,
                   MAX(b.phone) as phone
            FROM users u
            LEFT JOIN business_bookings b ON b.user_id = u.id
            WHERE u.role = 'user'
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `);
        return result.rows;
    }

    async getUserWithBookings(userId: string): Promise<any> {
        // Get user info
        const userResult = await query(`
            SELECT u.*, 
                   (SELECT temp_password FROM business_bookings WHERE user_id = u.id LIMIT 1) as temp_password
            FROM users u WHERE u.id = $1
        `, [userId]);

        if (userResult.rows.length === 0) return null;
        const user = userResult.rows[0];

        // Get all bookings for this user
        const bookingsResult = await query<BusinessBooking>(`
            SELECT b.*, s.title as service_title 
            FROM business_bookings b
            LEFT JOIN business_services s ON b.service_id = s.id
            WHERE b.user_id = $1
            ORDER BY b.created_at DESC
        `, [userId]);

        return {
            ...user,
            bookings: bookingsResult.rows
        };
    }

    async getUserBookings(userId: string): Promise<BusinessBooking[]> {
        const result = await query<BusinessBooking>(`
            SELECT b.*, s.title as service_title 
            FROM business_bookings b
            LEFT JOIN business_services s ON b.service_id = s.id
            WHERE b.user_id = $1
            ORDER BY b.created_at DESC
        `, [userId]);
        return result.rows;
    }

    // ==========================================
    // STATUS MANAGEMENT & TIMELINE
    // ==========================================
    async updateBookingStatus(bookingId: string, status: string, progress: number | undefined, notes: string | undefined, adminId: string): Promise<BusinessBooking | null> {
        // Get current status
        const current = await query<BusinessBooking>('SELECT status FROM business_bookings WHERE id = $1', [bookingId]);
        const oldStatus = current.rows[0]?.status;

        // Update booking
        const result = await query<BusinessBooking>(`
            UPDATE business_bookings 
            SET status = $1, progress = COALESCE($2, progress), admin_notes = COALESCE($3, admin_notes), updated_at = NOW()
            WHERE id = $4 RETURNING *
        `, [status, progress, notes, bookingId]);

        // Create history entry
        const historyId = uuidv4();
        await query(`
            INSERT INTO booking_status_history (id, booking_id, old_status, new_status, changed_by, notes)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [historyId, bookingId, oldStatus, status, adminId, notes]);

        return result.rows[0] || null;
    }

    async getStatusHistory(bookingId: string): Promise<any[]> {
        const result = await query(`
            SELECT h.*, u.email as changed_by_email
            FROM booking_status_history h
            LEFT JOIN users u ON h.changed_by = u.id
            WHERE h.booking_id = $1
            ORDER BY h.created_at DESC
        `, [bookingId]);
        return result.rows;
    }

    // ==========================================
    // CHAT MESSAGES
    // ==========================================
    async getBookingMessages(bookingId: string): Promise<any[]> {
        const result = await query(`
            SELECT m.*, u.email as sender_email
            FROM booking_messages m
            LEFT JOIN users u ON m.sender_id = u.id
            WHERE m.booking_id = $1
            ORDER BY m.created_at ASC
        `, [bookingId]);
        return result.rows;
    }

    async sendMessage(bookingId: string, senderId: string, senderRole: string, content: string, attachmentUrl?: string): Promise<any> {
        const id = uuidv4();
        const result = await query(`
            INSERT INTO booking_messages (id, booking_id, sender_id, sender_role, content, attachment_url)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `, [id, bookingId, senderId, senderRole, content, attachmentUrl || null]);
        return result.rows[0];
    }

    // ==========================================
    // DASHBOARD STATS
    // ==========================================
    async getDashboardStats(): Promise<any> {
        const stats = await query(`
            SELECT 
                COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
                COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
                COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
                COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count,
                COUNT(*) as total_bookings,
                (SELECT COUNT(*) FROM users WHERE role = 'user') as total_users,
                (SELECT COUNT(*) FROM business_services WHERE status = 'active') as active_services
            FROM business_bookings
        `);
        return stats.rows[0];
    }

    // ==========================================
    // STATS MANAGEMENT
    // ==========================================
    async getStats(): Promise<BusinessStat[]> {
        const result = await query<BusinessStat>('SELECT * FROM business_stats ORDER BY sort_order ASC, created_at DESC');
        return result.rows;
    }

    async createStat(dto: CreateBusinessStatDto): Promise<BusinessStat> {
        const id = uuidv4();
        const result = await query<BusinessStat>(
            `INSERT INTO business_stats (id, value, suffix, label, icon, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [id, dto.value, dto.suffix, dto.label, dto.icon || '📊', dto.sort_order || 0]
        );
        return result.rows[0];
    }

    async updateStat(id: string, dto: UpdateBusinessStatDto): Promise<BusinessStat | null> {
        const result = await query<BusinessStat>(
            `UPDATE business_stats 
             SET value = COALESCE($1, value), 
                 suffix = COALESCE($2, suffix),
                 label = COALESCE($3, label), 
                 icon = COALESCE($4, icon), 
                 sort_order = COALESCE($5, sort_order),
                 updated_at = NOW()
             WHERE id = $6 RETURNING *`,
            [dto.value, dto.suffix, dto.label, dto.icon, dto.sort_order, id]
        );
        return result.rows[0] || null;
    }

    async deleteStat(id: string): Promise<void> {
        await query('DELETE FROM business_stats WHERE id = $1', [id]);
    }

    // ==========================================
    // CASE STUDIES MANAGEMENT
    // ==========================================
    async getCaseStudies(): Promise<CaseStudy[]> {
        const result = await query<CaseStudy>('SELECT * FROM case_studies WHERE status = $1 ORDER BY sort_order ASC, created_at DESC', ['active']);
        return result.rows;
    }

    async getAllCaseStudies(): Promise<CaseStudy[]> {
        const result = await query<CaseStudy>('SELECT * FROM case_studies ORDER BY sort_order ASC, created_at DESC');
        return result.rows;
    }

    async getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
        const result = await query<CaseStudy>('SELECT * FROM case_studies WHERE slug = $1', [slug]);
        return result.rows[0] || null;
    }

    async createCaseStudy(dto: CreateCaseStudyDto): Promise<CaseStudy> {
        const id = uuidv4();
        const slug = dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const result = await query<CaseStudy>(
            `INSERT INTO case_studies (id, title, slug, client_name, client_logo, industry, challenge, solution, impact, result_metrics, cover_image_url, featured, sort_order, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
            [id, dto.title, slug, dto.client_name, dto.client_logo || '🏢', dto.industry, dto.challenge, dto.solution, dto.impact, dto.result_metrics || null, dto.cover_image_url || null, dto.featured || false, dto.sort_order || 0, dto.status || 'active']
        );
        return result.rows[0];
    }

    async updateCaseStudy(id: string, dto: UpdateCaseStudyDto): Promise<CaseStudy | null> {
        const slug = dto.title ? dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined;

        const result = await query<CaseStudy>(
            `UPDATE case_studies 
             SET title = COALESCE($1, title), 
                 slug = COALESCE($2, slug),
                 client_name = COALESCE($3, client_name),
                 client_logo = COALESCE($4, client_logo),
                 industry = COALESCE($5, industry),
                 challenge = COALESCE($6, challenge),
                 solution = COALESCE($7, solution),
                 impact = COALESCE($8, impact),
                 result_metrics = COALESCE($9, result_metrics),
                 cover_image_url = COALESCE($10, cover_image_url),
                 featured = COALESCE($11, featured),
                 sort_order = COALESCE($12, sort_order),
                 status = COALESCE($13, status),
                 updated_at = NOW()
             WHERE id = $14 RETURNING *`,
            [dto.title, slug, dto.client_name, dto.client_logo, dto.industry, dto.challenge, dto.solution, dto.impact, dto.result_metrics, dto.cover_image_url, dto.featured, dto.sort_order, dto.status, id]
        );
        return result.rows[0] || null;
    }

    async deleteCaseStudy(id: string): Promise<void> {
        await query('DELETE FROM case_studies WHERE id = $1', [id]);
    }
}

export const businessService = new BusinessServiceManager();

