import { query } from '../config/database.js';
import type {
    Post,
    CreatePostDto,
    UpdatePostDto,
    PostQueryParams,
} from '../models/Post.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Posts Service
 * Handles all post-related database operations
 */
export class PostsService {
    /**
     * Get all posts with filters
     */
    async getAll(params: PostQueryParams = {}): Promise<Post[]> {
        const {
            status,
            category,
            limit = 50,
            offset = 0,
            orderBy = 'created_at',
            order = 'desc',
        } = params;

        let sql = 'SELECT * FROM posts WHERE 1=1';
        const values: any[] = [];
        let paramIndex = 1;

        if (status) {
            sql += ` AND status = $${paramIndex++}`;
            values.push(status);
        }

        if (category) {
            sql += ` AND category = $${paramIndex++}`;
            values.push(category);
        }

        sql += ` ORDER BY ${orderBy} ${order.toUpperCase()}`;
        sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        values.push(limit, offset);

        const result = await query<Post>(sql, values);
        return result.rows;
    }

    /**
     * Get single post by ID
     */
    async getById(id: string): Promise<Post | null> {
        const result = await query<Post>(
            'SELECT * FROM posts WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    /**
     * Get single post by slug
     */
    async getBySlug(slug: string): Promise<Post | null> {
        const result = await query<Post>(
            'SELECT * FROM posts WHERE slug = $1',
            [slug]
        );
        return result.rows[0] || null;
    }

    /**
     * Create new post
     */
    async create(dto: CreatePostDto): Promise<Post> {
        const id = uuidv4();
        const now = new Date();

        const result = await query<Post>(
            `INSERT INTO posts (
        id, title, slug, excerpt, content, cover_image_url,
        meta_title, meta_description, category, status,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
      ) RETURNING *`,
            [
                id,
                dto.title,
                dto.slug,
                dto.excerpt,
                JSON.stringify(dto.content),
                dto.cover_image_url || null,
                dto.meta_title || null,
                dto.meta_description || null,
                dto.category,
                dto.status || 'draft',
                now,
                now,
            ]
        );

        return result.rows[0];
    }

    /**
     * Update post
     */
    async update(id: string, dto: UpdatePostDto): Promise<Post | null> {
        const existing = await this.getById(id);
        if (!existing) return null;

        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        const fields = [
            'title',
            'slug',
            'excerpt',
            'content',
            'cover_image_url',
            'meta_title',
            'meta_description',
            'category',
            'status',
        ] as const;

        for (const field of fields) {
            if (dto[field] !== undefined) {
                updates.push(`${field} = $${paramIndex++}`);
                values.push(
                    field === 'content' ? JSON.stringify(dto[field]) : dto[field]
                );
            }
        }

        if (updates.length === 0) return existing;

        updates.push(`updated_at = $${paramIndex++}`);
        values.push(new Date());
        values.push(id);

        const result = await query<Post>(
            `UPDATE posts SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            values
        );

        return result.rows[0] || null;
    }

    /**
     * Delete post
     */
    async delete(id: string): Promise<boolean> {
        const result = await query(
            'DELETE FROM posts WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rowCount !== null && result.rowCount > 0;
    }

    /**
     * Toggle post status
     */
    async toggleStatus(id: string): Promise<Post | null> {
        const result = await query<Post>(
            `UPDATE posts 
       SET status = CASE WHEN status = 'published' THEN 'draft' ELSE 'published' END,
           updated_at = NOW()
       WHERE id = $1 
       RETURNING *`,
            [id]
        );
        return result.rows[0] || null;
    }

    /**
     * Get posts grouped by category
     */
    async getGroupedByCategory(): Promise<Record<string, Post[]>> {
        const posts = await this.getAll({ limit: 1000 });
        const grouped: Record<string, Post[]> = {};

        for (const post of posts) {
            if (!grouped[post.category]) {
                grouped[post.category] = [];
            }
            grouped[post.category].push(post);
        }

        return grouped;
    }
}

export const postsService = new PostsService();
