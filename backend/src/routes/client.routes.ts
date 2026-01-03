import { Router } from 'express';
import { authMiddleware as auth } from '../middleware/auth.middleware.js';
import { query } from '../config/database.js';

const router = Router();

/**
 * Client Routes - For regular users to view their bookings
 * All routes require authentication
 */

// Get current user's bookings
router.get('/bookings', auth, async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const result = await query(`
            SELECT b.*, s.title as service_title 
            FROM business_bookings b
            LEFT JOIN business_services s ON b.service_id = s.id
            WHERE b.user_id = $1
            ORDER BY b.created_at DESC
        `, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Failed to get user bookings', err);
        res.status(500).json({ error: 'Failed to get bookings' });
    }
});

// Get single booking details
router.get('/bookings/:id', auth, async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const result = await query(`
            SELECT b.*, s.title as service_title 
            FROM business_bookings b
            LEFT JOIN business_services s ON b.service_id = s.id
            WHERE b.id = $1 AND b.user_id = $2
        `, [req.params.id, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get booking' });
    }
});

export default router;
