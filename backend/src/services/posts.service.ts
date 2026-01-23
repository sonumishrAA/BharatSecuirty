import { query } from '../config/database.js';
import type {
    Post,
    CreatePostDto,
    UpdatePostDto,
    PostQueryParams,
    EditorJSON,
} from '../models/Post.js';
import { v4 as uuidv4 } from 'uuid';
import { generateHtmlSnapshot, migrateToEditorJSON } from './html-snapshot.service.js';

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

        // If editor_json provided, generate html_snapshot
        let editorJson = dto.editor_json;
        let htmlSnapshot = '';

        if (!editorJson && dto.content) {
            // Migrate legacy content to editor_json
            editorJson = migrateToEditorJSON(dto.content);
        }

        if (editorJson) {
            htmlSnapshot = generateHtmlSnapshot(editorJson);
        }

        const result = await query<Post>(
            `INSERT INTO posts (
        id, title, slug, excerpt, content, editor_json, html_snapshot, cover_image_url,
        meta_title, meta_description, category, status,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      ) RETURNING *`,
            [
                id,
                dto.title,
                dto.slug,
                dto.excerpt,
                JSON.stringify(dto.content),
                editorJson ? JSON.stringify(editorJson) : null,
                htmlSnapshot,
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

        // Handle editor_json specially - generate html_snapshot
        if (dto.editor_json) {
            updates.push(`editor_json = $${paramIndex++}`);
            values.push(JSON.stringify(dto.editor_json));

            const htmlSnapshot = generateHtmlSnapshot(dto.editor_json);
            updates.push(`html_snapshot = $${paramIndex++}`);
            values.push(htmlSnapshot);
        }

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
     * Save draft (autosave) - Updates editor_json and creates version
     */
    async saveDraft(id: string, editorJson: EditorJSON): Promise<{ savedAt: Date }> {
        const existing = await this.getById(id);
        if (!existing) {
            throw new Error('Post not found');
        }

        const now = new Date();
        const htmlSnapshot = generateHtmlSnapshot(editorJson);

        // Update the post
        await query(
            `UPDATE posts SET 
        editor_json = $1, 
        html_snapshot = $2, 
        content = $3,
        updated_at = $4 
      WHERE id = $5`,
            [
                JSON.stringify(editorJson),
                htmlSnapshot,
                JSON.stringify(editorJson.flow),
                now,
                id
            ]
        );

        // Create version record
        await query(
            `INSERT INTO post_versions (post_id, version_type, editor_json, html_snapshot, created_at)
       VALUES ($1, 'autosave', $2, $3, $4)`,
            [id, JSON.stringify(editorJson), htmlSnapshot, now]
        );

        return { savedAt: now };
    }

    /**
     * Publish post - Generates final html_snapshot and creates published version
     */
    async publish(id: string, editorJson?: EditorJSON): Promise<Post | null> {
        const existing = await this.getById(id);
        if (!existing) return null;

        const now = new Date();
        let finalEditorJson = editorJson || existing.editor_json;

        // If no editor_json exists, migrate from content
        if (!finalEditorJson && existing.content) {
            finalEditorJson = migrateToEditorJSON(existing.content);
        }

        const htmlSnapshot = finalEditorJson ? generateHtmlSnapshot(finalEditorJson) : '';

        // Update post to published
        const result = await query<Post>(
            `UPDATE posts SET 
        status = 'published',
        editor_json = $1,
        html_snapshot = $2,
        content = $3,
        updated_at = $4
      WHERE id = $5 
      RETURNING *`,
            [
                finalEditorJson ? JSON.stringify(finalEditorJson) : null,
                htmlSnapshot,
                finalEditorJson ? JSON.stringify(finalEditorJson.flow) : JSON.stringify(existing.content),
                now,
                id
            ]
        );

        // Create published version
        if (finalEditorJson) {
            await query(
                `INSERT INTO post_versions (post_id, version_type, editor_json, html_snapshot, created_at)
         VALUES ($1, 'published', $2, $3, $4)`,
                [id, JSON.stringify(finalEditorJson), htmlSnapshot, now]
            );
        }

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

