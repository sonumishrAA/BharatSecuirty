import { Component, OnInit, signal, inject, AfterViewInit, HostListener, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostsService } from '@core/services/posts.service';
import { ToastService } from '@core/services/toast.service';
import { Post, PostCategory } from '@shared/models/post.model';
import { Meta, Title, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BlogCardComponent } from '../../components/blog-card/blog-card.component';
import { CtaCardComponent } from '../../components/cta-card/cta-card.component';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);


@Component({
    selector: 'app-post-view',
    standalone: true,
    imports: [CommonModule, DatePipe, RouterLink, FormsModule, BlogCardComponent, CtaCardComponent],
    templateUrl: './post-view.component.html',
    styleUrl: './post-view.component.scss'
})
export class PostViewComponent implements OnInit, AfterViewInit {
    post = signal<Post | null>(null);
    relatedPosts = signal<Post[]>([]);
    loading = signal(true);
    scaleFactor = signal(1);

    // Compute minimum canvas height to contain all floating images
    canvasMinHeight = computed(() => {
        const p = this.post();
        if (!p?.editor_json?.floating?.length) return 0;

        // Find the maximum (y + height) among all floating images
        // Add 60px offset that we add to y in the template
        const maxBottom = Math.max(...p.editor_json.floating.map(
            img => img.y + 60 + img.height
        ));

        return maxBottom + 40; // Add 40px extra padding
    });

    // Subscription
    email = '';

    private route = inject(ActivatedRoute);
    private postsService = inject(PostsService);
    private titleService = inject(Title);
    private metaService = inject(Meta);
    private sanitizer = inject(DomSanitizer);
    private toast = inject(ToastService);

    @HostListener('window:resize')
    onResize() {
        this.updateScaleFactor();
    }

    ngOnInit(): void {
        this.updateScaleFactor();
        this.route.paramMap.subscribe(params => {
            const slug = params.get('slug');
            if (slug) {
                this.loadPost(slug);
                // Scroll to top when slug changes
                window.scrollTo({ top: 0, behavior: 'instant' });
            }
        });
    }

    updateScaleFactor() {
        const viewportWidth = window.innerWidth;
        const containerPadding = 32; // 16px each side
        const canvasWidth = 1216;

        // On Mobile/Tablet (< 1000px), disable Zoom scaling and let CSS reflow handle it
        if (viewportWidth < 1000) {
            this.scaleFactor.set(1);
            return;
        }

        // On Desktop (> 1000px), scale down if window is smaller than canvas
        if (viewportWidth < canvasWidth + containerPadding) {
            const scale = (viewportWidth - containerPadding) / canvasWidth;
            this.scaleFactor.set(Math.max(0.3, scale));
        } else {
            this.scaleFactor.set(1);
        }
    }

    ngAfterViewInit() {
        // We need to wait for post to load for some elements, 
        // but can animate static structure first or use effect
    }

    animateContent() {
        // Wait for next macrotask to ensure DOM is rendered
        setTimeout(() => {
            const tl = gsap.timeline();

            tl.from('.post-title', {
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out'
            })
                .from('.breadcrumb', {
                    y: 20,
                    opacity: 0,
                    duration: 0.6,
                    ease: 'power3.out'
                }, '-=0.6')
                .from('.post-meta-header', {
                    y: 20,
                    opacity: 0,
                    duration: 0.6,
                    ease: 'power3.out'
                }, '-=0.4');

            // Animate Body Content
            gsap.from('.blog-canvas', {
                scrollTrigger: {
                    trigger: '.blog-canvas',
                    start: 'top 85%'
                },
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out'
            });

            // Sidebar Widgets
            const widgets = gsap.utils.toArray('.sidebar-widget');
            widgets.forEach((widget: any, i) => {
                gsap.from(widget, {
                    scrollTrigger: {
                        trigger: widget,
                        start: 'top 90%'
                    },
                    x: 30,
                    opacity: 0,
                    duration: 0.6,
                    delay: i * 0.1,
                    ease: 'power3.out'
                });
            });

            // Author Box
            gsap.from('.author-box', {
                scrollTrigger: {
                    trigger: '.author-box',
                    start: 'top 90%'
                },
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out'
            });

            // Bottom CTA
            gsap.from('.post-cta-banner', {
                scrollTrigger: {
                    trigger: '.post-cta-banner',
                    start: 'top 85%'
                },
                scale: 0.9,
                opacity: 0,
                duration: 0.8,
                ease: 'back.out(1.7)'
            });
        }, 100);
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

                // Trigger animations
                this.animateContent();
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
        if (!post) return '';

        // If html_snapshot exists (Canvas Editor format), render it directly
        if (post.html_snapshot) {
            return this.sanitizer.bypassSecurityTrustHtml(post.html_snapshot);
        }

        // Fallback for legacy posts (TipTap JSON)
        if (post.content) {
            const html = this.renderNode(post.content);
            return this.sanitizer.bypassSecurityTrustHtml(html);
        }

        return '';
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
            // Handle empty paragraphs (Enter key creates new paragraph)
            return `<p>${content || '<br>'}</p>`;
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

        // SKIP inline images - all images should come from floating layer only
        // This prevents duplicates when images accidentally end up in both layers
        if (type === 'imageBlock' || type === 'image') {
            return ''; // Render nothing - floating layer handles all images
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
            // Handle both 'bold' and 'strong' (ngx-editor uses 'strong')
            if (mark.type === 'bold' || mark.type === 'strong') text = `<strong>${text}</strong>`;
            // Handle both 'italic' and 'em' (ngx-editor uses 'em')
            if (mark.type === 'italic' || mark.type === 'em') text = `<em>${text}</em>`;
            if (mark.type === 'underline') text = `<u>${text}</u>`;
            if (mark.type === 'strike') text = `<s>${text}</s>`;

            if (mark.type === 'link') {
                let href = mark.attrs?.href || '';
                // Prepend https:// if no protocol is present to avoid relative link behavior
                if (href && !/^https?:\/\//i.test(href)) {
                    href = 'https://' + href;
                }
                text = `<a href="${href}" target="_blank">${text}</a>`;
            }

            // Handle both naming conventions for colors
            if (mark.type === 'text_color' || mark.type === 'textColor') styles.push(`color: ${mark.attrs?.color}`);
            if (mark.type === 'background_color' || mark.type === 'backgroundColor') styles.push(`background-color: ${mark.attrs?.color}`);

            // Handle code mark
            if (mark.type === 'code') text = `<code>${text}</code>`;
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
