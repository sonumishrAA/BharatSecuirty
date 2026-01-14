import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostsService } from '@core/services/posts.service';
import { ToastService } from '@core/services/toast.service';
import { Post, PostCategory } from '@shared/models/post.model';
import { Meta, Title, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BlogCardComponent } from '../../components/blog-card/blog-card.component';
import { CtaCardComponent } from '../../components/cta-card/cta-card.component';


@Component({
    selector: 'app-post-view',
    standalone: true,
    imports: [CommonModule, DatePipe, RouterLink, FormsModule, BlogCardComponent, CtaCardComponent],
    templateUrl: './post-view.component.html',
    styleUrl: './post-view.component.scss'
})
export class PostViewComponent implements OnInit {
    post = signal<Post | null>(null);
    relatedPosts = signal<Post[]>([]);
    loading = signal(true);

    // Subscription
    email = '';

    private route = inject(ActivatedRoute);
    private postsService = inject(PostsService);
    private titleService = inject(Title);
    private metaService = inject(Meta);
    private sanitizer = inject(DomSanitizer);
    private toast = inject(ToastService);

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const slug = params.get('slug');
            if (slug) {
                this.loadPost(slug);
                // Scroll to top when slug changes
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    loadPost(slug: string): void {
        this.loading.set(true);
        this.postsService.getBySlug(slug).subscribe({
            next: (post) => {
                this.post.set(post);
                this.loading.set(false);

                // Set meta tags
                this.titleService.setTitle(post.meta_title || post.title);
                if (post.meta_description) {
                    this.metaService.updateTag({ name: 'description', content: post.meta_description });
                }

                // Fetch related posts
                this.loadRelatedPosts(post.category);
            },
            error: () => {
                this.loading.set(false);
            }
        });
    }

    loadRelatedPosts(category: PostCategory): void {
        this.postsService.getPublished(category, 3).subscribe({
            next: (posts) => {
                // Filter out current post
                const currentId = this.post()?.id;
                const related = posts.filter(p => p.id !== currentId).slice(0, 3); // Take top 3
                this.relatedPosts.set(related);
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

    subscribe(event: Event): void {
        event.preventDefault();
        if (this.email) {
            this.postsService.subscribe(this.email).subscribe({
                next: () => {
                    this.toast.success(`Thanks for subscribing! We'll send updates to ${this.email}`);
                    this.email = '';
                },
                error: (err) => {
                    if (err.status === 409 || err.error?.message?.includes('already')) {
                        this.toast.info('You are already subscribed!');
                    } else {
                        this.toast.error('Failed to subscribe. Please try again.');
                    }
                }
            });
        }
    }

    getInitials(name?: string): string {
        if (!name) return 'BS';
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }

    formatCategory(category: string): string {
        return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    private renderNode(node: any): string {
        if (!node) return '';

        const type = node.type;

        if (type === 'doc') {
            return (node.content || []).map((n: any) => this.renderNode(n)).join('');
        }

        if (type === 'text') {
            return this.renderText(node);
        }

        if (type === 'paragraph') {
            const content = (node.content || []).map((n: any) => this.renderNode(n)).join('');
            return `<p>${content}</p>`;
        }

        if (type === 'heading') {
            const level = node.attrs?.level || 2;
            const content = (node.content || []).map((n: any) => this.renderNode(n)).join('');
            const id = this.slugify(node.textContent || content.replace(/<[^>]*>?/gm, ''));
            return `<h${level} id="${id}">${content}</h${level}>`;
        }

        // Handle both camelCase and snake_case for bullet list
        if (type === 'bulletList' || type === 'bullet_list') {
            const items = (node.content || []).map((n: any) => this.renderNode(n)).join('');
            return `<ul>${items}</ul>`;
        }

        // Handle both camelCase and snake_case for ordered list
        if (type === 'orderedList' || type === 'ordered_list') {
            const items = (node.content || []).map((n: any) => this.renderNode(n)).join('');
            return `<ol>${items}</ol>`;
        }

        // Handle both camelCase and snake_case for list item
        if (type === 'listItem' || type === 'list_item') {
            const content = (node.content || []).map((n: any) => this.renderNode(n)).join('');
            return `<li>${content}</li>`;
        }

        if (type === 'imageBlock' || type === 'image') {
            const src = node.attrs?.src || '';
            const caption = node.attrs?.caption || node.attrs?.alt || '';
            return `<figure class="post-image"><img src="${src}" alt="${caption}"/>${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;
        }

        if (type === 'blockquote') {
            const content = (node.content || []).map((n: any) => this.renderNode(n)).join('');
            return `<blockquote>${content}</blockquote>`;
        }

        // Handle code blocks
        if (type === 'codeBlock' || type === 'code_block') {
            const content = (node.content || []).map((n: any) => n.text || '').join('');
            return `<pre><code>${content}</code></pre>`;
        }

        // Handle horizontal rule
        if (type === 'horizontalRule' || type === 'horizontal_rule') {
            return `<hr/>`;
        }

        // Handle hard break
        if (type === 'hardBreak' || type === 'hard_break') {
            return `<br/>`;
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

    slugify(text: string): string {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    }

    sharePost(platform: string): void {
        const post = this.post();
        if (!post) return;

        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(post.title);
        let shareUrl = '';

        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'whatsapp':
                shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
                break;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    }
}
