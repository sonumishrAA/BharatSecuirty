import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post, PostDto, PostCategory, PostStatus } from '@shared/models/post.model';
import { environment } from '../../../environments/environment';

export interface PostQueryParams {
    status?: PostStatus;
    category?: PostCategory;
    limit?: number;
    offset?: number;
    orderBy?: 'created_at' | 'updated_at' | 'title';
    order?: 'asc' | 'desc';
}

@Injectable({
    providedIn: 'root'
})
export class PostsService {
    private readonly API_URL = `${environment.apiUrl}/posts`;

    constructor(private http: HttpClient) { }

    /**
     * Get all posts with optional filters
     */
    getAll(params: PostQueryParams = {}): Observable<Post[]> {
        let httpParams = new HttpParams();

        if (params.status) httpParams = httpParams.set('status', params.status);
        if (params.category) httpParams = httpParams.set('category', params.category);
        if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
        if (params.offset) httpParams = httpParams.set('offset', params.offset.toString());
        if (params.orderBy) httpParams = httpParams.set('orderBy', params.orderBy);
        if (params.order) httpParams = httpParams.set('order', params.order);

        return this.http.get<Post[]>(this.API_URL, { params: httpParams });
    }

    /**
     * Get post by ID
     */
    getById(id: string): Observable<Post> {
        return this.http.get<Post>(`${this.API_URL}/${id}`);
    }

    /**
     * Get post by slug
     */
    getBySlug(slug: string): Observable<Post> {
        return this.http.get<Post>(`${this.API_URL}/slug/${slug}`);
    }

    /**
     * Get posts grouped by category
     */
    getGroupedByCategory(): Observable<Record<string, Post[]>> {
        return this.http.get<Record<string, Post[]>>(`${this.API_URL}/categories/grouped`);
    }

    /**
     * Create new post
     */
    create(dto: PostDto): Observable<Post> {
        return this.http.post<Post>(this.API_URL, dto);
    }

    /**
     * Update post
     */
    update(id: string, dto: Partial<PostDto>): Observable<Post> {
        return this.http.put<Post>(`${this.API_URL}/${id}`, dto);
    }

    /**
     * Delete post
     */
    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${id}`);
    }

    /**
     * Toggle post status
     */
    toggleStatus(id: string): Observable<Post> {
        return this.http.patch<Post>(`${this.API_URL}/${id}/status`, {});
    }

    /**
     * Get published posts for public site
     */
    getPublished(category?: PostCategory, limit = 10): Observable<Post[]> {
        return this.getAll({
            status: 'published',
            category,
            limit,
            orderBy: 'created_at',
            order: 'desc'
        });
    }
}
