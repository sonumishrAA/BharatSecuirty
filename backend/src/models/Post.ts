/**
 * Post Model
 * Matches the database schema for posts table
 */
export interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: Record<string, any>; // TipTap JSON content
    cover_image_url: string | null;
    meta_title: string | null;
    meta_description: string | null;
    category: PostCategory;
    status: PostStatus;
    created_at: Date;
    updated_at: Date;
}

export type PostCategory = 'blog' | 'scam_alert' | 'osint_guide' | 'resource' | 'case_studies';
export type PostStatus = 'draft' | 'published';

/**
 * Create Post DTO
 */
export interface CreatePostDto {
    title: string;
    slug: string;
    excerpt: string;
    content: Record<string, any>;
    cover_image_url?: string;
    meta_title?: string;
    meta_description?: string;
    category: PostCategory;
    status?: PostStatus;
}

/**
 * Update Post DTO
 */
export interface UpdatePostDto extends Partial<CreatePostDto> { }

/**
 * Post List Query Params
 */
export interface PostQueryParams {
    status?: PostStatus;
    category?: PostCategory;
    limit?: number;
    offset?: number;
    orderBy?: 'created_at' | 'updated_at' | 'title';
    order?: 'asc' | 'desc';
}
