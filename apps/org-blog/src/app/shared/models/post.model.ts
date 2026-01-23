/**
 * Post Model
 */
import { EditorJSON } from './editor-json.model';

export interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: any; // Legacy TipTap JSON (for backwards compatibility)
    editor_json?: EditorJSON; // New canvas editor format
    html_snapshot?: string; // Pre-rendered HTML for public view
    cover_image_url: string | null;
    meta_title: string | null;
    meta_description: string | null;
    category: PostCategory;
    status: PostStatus;
    author_name?: string;
    author_bio?: string;
    author_avatar_url?: string;
    created_at: string;
    updated_at: string;
}

export type PostCategory = 'blog' | 'scam_alert' | 'osint_guide' | 'resource' | 'case_studies';
export type PostStatus = 'draft' | 'published';

/**
 * Create/Update Post DTO
 */
export interface PostDto {
    title: string;
    slug: string;
    excerpt: string;
    content: any;
    editor_json?: EditorJSON; // New canvas editor format
    cover_image_url?: string;
    meta_title?: string;
    meta_description?: string;
    category: PostCategory;
    status?: PostStatus;
}
