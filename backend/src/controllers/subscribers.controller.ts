import { Request, Response } from 'express';
import { pool } from '../config/database';
import { CreateSubscriberDto } from '../models/Subscriber';

export class SubscribersController {
    // Public: Subscribe
    async subscribe(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body as CreateSubscriberDto;

            if (!email) {
                res.status(400).json({ message: 'Email is required' });
                return;
            }

            // Check if exists
            const existing = await pool.query(
                'SELECT * FROM subscribers WHERE email = $1',
                [email]
            );

            if (existing.rows.length > 0) {
                // If unsubscribed, reactivate? For now just say success or already subscribed
                res.status(200).json({ message: 'Already subscribed' });
                return;
            }

            const result = await pool.query(
                `INSERT INTO subscribers (email) 
                 VALUES ($1) 
                 RETURNING *`,
                [email]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error subscribing:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Admin: Get All
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const result = await pool.query(
                'SELECT * FROM subscribers ORDER BY created_at DESC'
            );
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching subscribers:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export const subscribersController = new SubscribersController();
