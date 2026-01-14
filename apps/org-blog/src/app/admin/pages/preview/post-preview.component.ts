import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PostsService } from '@core/services/posts.service';
import { Post, PostCategory } from '@shared/models/post.model';

@Component({
    selector: 'app-post-preview',
    standalone: true,
    imports: [DatePipe],
    template: `
        <div class="preview-banner">
            <span class="material-icons-round">visibility</span>
            ADMIN PREVIEW MODE - This is how the post will appear to visitors
            <button (click)="closePreview()">Close Preview</button>
        </div>
        
        <article class="post-view">
            <div class="container">
                @if (loading()) {
                <div class="skeleton-post">
                    <div class="skeleton-meta">
                        <div class="skeleton-line short"></div>
                        <div class="skeleton-line tiny"></div>
                    </div>
                    <div class="skeleton-line title"></div>
                    <div class="skeleton-cover"></div>
                    <div class="skeleton-content">
                        <div class="skeleton-line"></div>
                        <div class="skeleton-line"></div>
                        <div class="skeleton-line medium"></div>
                    </div>
                </div>
                }

                @if (!loading() && previewData) {
                <!-- COVER IMAGE -->
                @if (previewData.cover_image_url) {
                <div class="post-cover">
                    <img [src]="previewData.cover_image_url" [alt]="previewData.title" />
                </div>
                }

                <!-- META -->
                <div class="post-meta">
                    <span class="post-date">{{ today | date:'mediumDate' }}</span>
                    <span class="post-category">{{ formatCategory(previewData.category) }}</span>
                </div>

                <!-- TITLE -->
                <h1 class="post-title">{{ previewData.title || 'Untitled Post' }}</h1>
                
                <!-- EXCERPT -->
                <p class="post-excerpt">{{ previewData.excerpt }}</p>

                <!-- CONTENT -->
                <div class="post-content" [innerHTML]="renderContent()"></div>
                }

                @if (!loading() && !previewData) {
                <p class="not-found">No preview data available</p>
                }
            </div>
        </article>
    `,
    styleUrl: './post-preview.component.scss'
})
export class PostPreviewComponent implements OnInit {
    loading = signal(true);
    previewData: any = null;
    today = new Date();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private postsService: PostsService
    ) { }

    ngOnInit(): void {
        // Try to get data from localStorage (for new unsaved posts)
        const storedData = localStorage.getItem('admin_preview_data');
        if (storedData) {
            this.previewData = JSON.parse(storedData);
            this.loading.set(false);
            return;
        }

        // Try to get from URL param (for existing posts)
        const id = this.route.snapshot.queryParamMap.get('id');
        if (id) {
            this.postsService.getById(id).subscribe({
                next: (post) => {
                    this.previewData = post;
                    this.loading.set(false);
                },
                error: () => {
                    this.loading.set(false);
                }
            });
        } else {
            this.loading.set(false);
        }
    }

    formatCategory(cat: PostCategory): string {
        return cat?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Blog';
    }

    renderContent(): string {
        if (!this.previewData?.content?.content) return '';

        const renderNode = (node: any): string => {
            if (!node) return '';

            if (node.type === 'text') {
                let text = node.text || '';
                if (node.marks) {
                    node.marks.forEach((mark: any) => {
                        if (mark.type === 'bold') text = `<strong>${text}</strong>`;
                        if (mark.type === 'italic') text = `<em>${text}</em>`;
                        if (mark.type === 'underline') text = `<u>${text}</u>`;
                        if (mark.type === 'strike') text = `<s>${text}</s>`;
                        if (mark.type === 'link') text = `<a href="${mark.attrs?.href}" target="_blank">${text}</a>`;
                        if (mark.type === 'textColor') text = `<span style="color:${mark.attrs?.color}">${text}</span>`;
                        if (mark.type === 'backgroundColor') text = `<span style="background-color:${mark.attrs?.color}">${text}</span>`;
                    });
                }
                return text;
            }

            const children = node.content?.map(renderNode).join('') || '';

            switch (node.type) {
                case 'paragraph': return `<p>${children}</p>`;
                case 'heading': return `<h${node.attrs?.level || 1}>${children}</h${node.attrs?.level || 1}>`;
                case 'bulletList': return `<ul>${children}</ul>`;
                case 'orderedList': return `<ol>${children}</ol>`;
                case 'listItem': return `<li>${children}</li>`;
                case 'blockquote': return `<blockquote>${children}</blockquote>`;
                case 'codeBlock': return `<pre><code>${children}</code></pre>`;
                case 'image': return `<img src="${node.attrs?.src}" alt="${node.attrs?.alt || ''}" />`;
                default: return children;
            }
        };

        return this.previewData.content.content.map(renderNode).join('');
    }

    closePreview(): void {
        window.close();
    }
}
