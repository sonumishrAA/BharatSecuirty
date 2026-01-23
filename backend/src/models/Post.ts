/**
 * Post Model
 * Matches the database schema for posts table
 */

// ===== Editor JSON Types =====
export interface CanvasMeta {
    canvasWidth: number;
    canvasPadding: number;
    version: number;
}

export interface FlowDocument {
    type: 'doc';
    content: any[];
}

export interface FloatingItem {
    id: string;
    type: 'image';
    src: string;
    alt?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    rotation?: number;
    caption?: string;
}

export interface EditorJSON {
    meta: CanvasMeta;
    flow: FlowDocument;
    floating: FloatingItem[];
}

// ===== Post Model =====
export interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: Record<string, any>; // Legacy TipTap JSON content
    editor_json: EditorJSON | null; // New canvas editor format
    html_snapshot: string | null; // Pre-rendered HTML for public view
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
    editor_json?: EditorJSON;
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

