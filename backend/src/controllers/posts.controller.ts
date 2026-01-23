import { Request, Response } from 'express';
import { postsService } from '../services/posts.service.js';
import type { CreatePostDto, UpdatePostDto, PostQueryParams } from '../models/Post.js';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Helper to sanitize URLs (replace localhost with actual BASE_URL)
 */
const sanitizeUrl = (url: string | null): string | null => {
    if (!url) return null;
    // Replace http://localhost:3000 or http://localhost:8080 with environment BASE_URL
    return url.replace(/http:\/\/localhost:\d+/g, BASE_URL);
};

/**
 * Recursive function to sanitize content JSON
 */
const sanitizeContent = (content: any): any => {
    if (!content) return content;

    if (Array.isArray(content)) {
        return content.map(item => sanitizeContent(item));
    }

    if (typeof content === 'object' && content !== null) {
        const sanitized: any = { ...content };

        // If this is an image node with a src
        if (sanitized.type === 'image' && sanitized.attrs && sanitized.attrs.src) {
            sanitized.attrs.src = sanitizeUrl(sanitized.attrs.src);
        }

        // Recursively check 'content' array
        if (sanitized.content) {
            sanitized.content = sanitizeContent(sanitized.content);
        }

        return sanitized;
    }

    return content;
};

/**
 * Helper to attach full URL to a post and sanitize content
 */
const preparePost = (post: any) => ({
    ...post,
    url: `${FRONTEND_URL}/blog/${post.slug}`,
    cover_image_url: sanitizeUrl(post.cover_image_url),
    content: sanitizeContent(post.content)
});

/**
 * Posts Controller
 * Handles all post-related endpoints
 */
export class PostsController {
    /**
     * GET /api/posts
     */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const params: PostQueryParams = {
                status: req.query.status as any,
                category: req.query.category as any,
                limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
                offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
                orderBy: req.query.orderBy as any,
                order: req.query.order as any,
            };

            const posts = await postsService.getAll(params);
            const postsWithUrl = posts.map(preparePost);
            res.json(postsWithUrl);
        } catch (error) {
            console.error('Get posts error:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to fetch posts',
            });
        }
    }

    /**
     * GET /api/posts/:id
     */
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const post = await postsService.getById(req.params.id);

            if (!post) {
                res.status(404).json({
                    error: 'Not Found',
                    message: 'Post not found',
                });
                return;
            }

            res.json(preparePost(post));
        } catch (error) {
            console.error('Get post error:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to fetch post',
            });
        }
    }

    /**
     * GET /api/posts/slug/:slug
     */
    async getBySlug(req: Request, res: Response): Promise<void> {
        try {
            const post = await postsService.getBySlug(req.params.slug);

            if (!post) {
                res.status(404).json({
                    error: 'Not Found',
                    message: 'Post not found',
                });
                return;
            }

            res.json(preparePost(post));
        } catch (error) {
            console.error('Get post by slug error:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to fetch post',
            });
        }
    }

    /**
     * POST /api/posts
     */
    async create(req: Request, res: Response): Promise<void> {
        try {
            const dto: CreatePostDto = req.body;

            if (!dto.title || !dto.slug || !dto.excerpt || !dto.category) {
                res.status(400).json({
                    error: 'Bad Request',
                    message: 'Title, slug, excerpt, and category are required',
                });
                return;
            }

            const post = await postsService.create(dto);
            res.status(201).json(preparePost(post));
        } catch (error) {
            console.error('Create post error:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to create post',
            });
        }
    }

    /**
     * PUT /api/posts/:id
     */
    async update(req: Request, res: Response): Promise<void> {
        try {
            const dto: UpdatePostDto = req.body;
            const post = await postsService.update(req.params.id, dto);

            if (!post) {
                res.status(404).json({
                    error: 'Not Found',
                    message: 'Post not found',
                });
                return;
            }

            res.json(preparePost(post));
        } catch (error) {
            console.error('Update post error:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to update post',
            });
        }
    }

    /**
     * DELETE /api/posts/:id
     */
    async delete(req: Request, res: Response): Promise<void> {
        try {
            const deleted = await postsService.delete(req.params.id);

            if (!deleted) {
                res.status(404).json({
                    error: 'Not Found',
                    message: 'Post not found',
                });
                return;
            }

            res.json({ message: 'Post deleted successfully' });
        } catch (error) {
            console.error('Delete post error:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to delete post',
            });
        }
    }

    /**
     * PATCH /api/posts/:id/status
     */
    async toggleStatus(req: Request, res: Response): Promise<void> {
        try {
            const post = await postsService.toggleStatus(req.params.id);

            if (!post) {
                res.status(404).json({
                    error: 'Not Found',
                    message: 'Post not found',
                });
                return;
            }

            res.json(preparePost(post));
        } catch (error) {
            console.error('Toggle status error:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to toggle status',
            });
        }
    }

    /**
     * PUT /api/posts/:id/draft - Autosave draft
     */
    async saveDraft(req: Request, res: Response): Promise<void> {
        try {
            const { editor_json } = req.body;

            if (!editor_json) {
                res.status(400).json({
                    error: 'Bad Request',
                    message: 'editor_json is required',
                });
                return;
            }

            const result = await postsService.saveDraft(req.params.id, editor_json);
            res.json({
                success: true,
                saved_at: result.savedAt.toISOString(),
            });
        } catch (error: any) {
            console.error('Save draft error:', error);
            if (error.message === 'Post not found') {
                res.status(404).json({
                    error: 'Not Found',
                    message: 'Post not found',
                });
                return;
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to save draft',
            });
        }
    }

    /**
     * PUT /api/posts/:id/publish - Publish post
     */
    async publish(req: Request, res: Response): Promise<void> {
        try {
            const { editor_json } = req.body;
            const post = await postsService.publish(req.params.id, editor_json);

            if (!post) {
                res.status(404).json({
                    error: 'Not Found',
                    message: 'Post not found',
                });
                return;
            }

            res.json(preparePost(post));
        } catch (error) {
            console.error('Publish error:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to publish post',
            });
        }
    }

    /**
     * GET /api/posts/categories/grouped
     */
    async getGroupedByCategory(req: Request, res: Response): Promise<void> {
        try {
            const grouped = await postsService.getGroupedByCategory();

            // Allow dynamic typing for the mapped object
            const groupedWithUrl: Record<string, any[]> = {};

            for (const [category, posts] of Object.entries(grouped)) {
                groupedWithUrl[category] = posts.map(preparePost);
            }

            res.json(groupedWithUrl);
        } catch (error) {
            console.error('Get grouped posts error:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to fetch grouped posts',
            });
        }
    }
}

export const postsController = new PostsController();

