import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PostsService } from '@core/services/posts.service';
import { Post } from '@shared/models/post.model';
import { Meta, Title, DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'app-post-view',
    standalone: true,
    imports: [DatePipe],
    templateUrl: './post-view.component.html',
    styleUrl: './post-view.component.scss'
})
export class PostViewComponent implements OnInit {
    post = signal<Post | null>(null);
    loading = signal(true);

    constructor(
        private route: ActivatedRoute,
        private postsService: PostsService,
        private titleService: Title,
        private metaService: Meta,
        private sanitizer: DomSanitizer
    ) { }

    ngOnInit(): void {
        const slug = this.route.snapshot.paramMap.get('slug');
        if (slug) {
            this.loadPost(slug);
        }
    }

    loadPost(slug: string): void {
        this.postsService.getBySlug(slug).subscribe({
            next: (post) => {
                this.post.set(post);
                this.loading.set(false);

                // Set meta tags
                this.titleService.setTitle(post.meta_title || post.title);
                if (post.meta_description) {
                    this.metaService.updateTag({ name: 'description', content: post.meta_description });
                }
            },
            error: () => {
                this.loading.set(false);
            }
        });
    }

    renderContent(): SafeHtml {
        const post = this.post();
        if (!post?.content) return '';

        // Simple TipTap JSON to HTML renderer
        const html = this.renderNode(post.content);
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }

    private renderNode(node: any): string {
        if (!node) return '';

        if (node.type === 'doc') {
            return (node.content || []).map((n: any) => this.renderNode(n)).join('');
        }

        if (node.type === 'text') {
            return this.renderText(node);
        }

        if (node.type === 'paragraph') {
            const content = (node.content || []).map((n: any) => this.renderNode(n)).join('');
            return `<p>${content}</p>`;
        }

        if (node.type === 'heading') {
            const level = node.attrs?.level || 2;
            const content = (node.content || []).map((n: any) => this.renderNode(n)).join('');
            return `<h${level}>${content}</h${level}>`;
        }

        if (node.type === 'bulletList') {
            const items = (node.content || []).map((n: any) => this.renderNode(n)).join('');
            return `<ul>${items}</ul>`;
        }

        if (node.type === 'listItem') {
            const content = (node.content || []).map((n: any) => this.renderNode(n)).join('');
            return `<li>${content}</li>`;
        }

        if (node.type === 'imageBlock' || node.type === 'image') {
            const src = node.attrs?.src || '';
            const caption = node.attrs?.caption || node.attrs?.alt || '';
            return `<figure class="post-image"><img src="${src}" alt="${caption}"/>${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;
        }

        if (node.type === 'blockquote') {
            const content = (node.content || []).map((n: any) => this.renderNode(n)).join('');
            return `<blockquote>${content}</blockquote>`;
        }

        return '';
    }

    private renderText(node: any): string {
        if (node.type !== 'text') return '';

        let text = node.text || '';
        let styles: string[] = [];

        (node.marks || []).forEach((mark: any) => {
            if (mark.type === 'bold') text = `<strong>${text}</strong>`;
            if (mark.type === 'italic') text = `<em>${text}</em>`;
            if (mark.type === 'underline') text = `<u>${text}</u>`;

            if (mark.type === 'link') {
                let href = mark.attrs?.href || '';
                // Prepend https:// if no protocol is present to avoid relative link behavior
                if (href && !/^https?:\/\//i.test(href)) {
                    href = 'https://' + href;
                }
                text = `<a href="${href}" target="_blank">${text}</a>`;
            }

            if (mark.type === 'text_color') styles.push(`color: ${mark.attrs?.color}`);
            if (mark.type === 'background_color') styles.push(`background-color: ${mark.attrs?.color}`);
        });

        if (styles.length > 0) {
            text = `<span style="${styles.join('; ')}">${text}</span>`;
        }

        return text;
    }
}
