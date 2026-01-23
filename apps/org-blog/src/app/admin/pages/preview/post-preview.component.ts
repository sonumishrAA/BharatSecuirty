import { Component, OnInit, signal, inject, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostsService } from '@core/services/posts.service';
import { Post, PostCategory } from '@shared/models/post.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from '@environments';

@Component({
    selector: 'app-post-preview',
    standalone: true,
    imports: [CommonModule, DatePipe, FormsModule],
    template: `
        <!-- PREVIEW BANNER -->
        <div class="preview-banner">
            <span class="material-icons-round">visibility</span>
            ADMIN PREVIEW MODE - This is exactly how the post will appear to visitors
            <button (click)="closePreview()">
                <span class="material-icons-round">close</span>
                Close Preview
            </button>
        </div>
        
        <!-- PUBLIC NAVBAR -->
        <header class="navbar" [class.scrolled]="scrolled()">
            <div class="container nav-container">
                <a class="nav-logo">
                    <span class="logo-icon neon-text">🛡️</span>
                    <span class="logo-text">BHARAT<span class="neon-text">SECURITY</span></span>
                </a>
                <nav class="nav-menu">
                    <a class="nav-link active">Home</a>
                    <a class="nav-link">Blog</a>
                    <a class="nav-link">OSINT</a>
                    <a class="nav-link">Scam Alert</a>
                    <a class="nav-link">Resources</a>
                </nav>
                <div class="nav-actions">
                    <a href="https://bharatsecurity.com" class="btn-cta">
                        <span>Start Protection</span>
                        <span class="material-icons-round">bolt</span>
                    </a>
                </div>
            </div>
        </header>

        <!-- MAIN CONTENT -->
        <article class="post-view">
            @if (loading()) {
            <div class="container">
                <div class="skeleton-post">
                    <div class="skeleton-header">
                        <div class="skeleton-line short"></div>
                        <div class="skeleton-line title"></div>
                    </div>
                    <div class="skeleton-content">
                        <div class="skeleton-line"></div>
                        <div class="skeleton-line"></div>
                        <div class="skeleton-line medium"></div>
                    </div>
                </div>
            </div>
            } @else if (previewData) {
            <div class="post-header-section">
                <div class="container">
                    <!-- Breadcrumb -->
                    <div class="breadcrumb">
                        <a>Article</a>
                        <span class="separator">/</span>
                        <span class="current">{{ formatCategory(previewData.category) }}</span>
                    </div>

                    <h1 class="post-title">{{ previewData.title || 'Untitled Post' }}</h1>

                    <div class="post-meta-header">
                        <div class="author-mini">
                            <div class="avatar-sm">{{ getInitials(previewData.author_name || 'BS') }}</div>
                            <div class="meta-text">
                                <span class="author-name">{{ previewData.author_name || 'Bharat Security Team' }}</span>
                                <span class="publish-date">{{ today | date:'MMMM d, yyyy' }}</span>
                            </div>
                        </div>
                        <span class="read-time">5 min read</span>
                    </div>
                </div>
            </div>

            <div class="container">
                <div class="post-layout full-width">
                    <div class="post-main">
                        <!-- Article Body -->
                        <div class="article-body" [innerHTML]="renderContent()"></div>

                        <!-- Author Box -->
                        <div class="author-box">
                            <div class="author-avatar">{{ getInitials(previewData.author_name || 'BS') }}</div>
                            <div class="author-info">
                                <h4>{{ previewData.author_name || 'Bharat Security Team' }}</h4>
                                <p>{{ previewData.author_bio || 'Experts in Cyber Security, OSINT, and Fraud Prevention. dedicated to making the internet safer for everyone.' }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Bottom CTA Banner -->
                <div class="post-cta-banner">
                    <div class="banner-content">
                        <h2>Need expert help with cybersecurity?</h2>
                        <p>Our team of experts can help you secure your digital assets and investigate threats.</p>
                    </div>
                    <div class="banner-actions">
                        <a href="https://bharatsecurity.com/contact" class="btn-primary">Contact Us</a>
                    </div>
                </div>
            </div>
            } @else {
            <div class="container not-found-container">
                <h2>No preview data available</h2>
                <button (click)="closePreview()" class="btn-back">Close Preview</button>
            </div>
            }
        </article>

        <!-- PUBLIC FOOTER -->
        <footer class="footer">
            <div class="container footer-container">
                <div class="footer-brand">
                    <a class="footer-logo">
                        <span class="logo-text">BHARAT<span class="neon-text">SECURITY</span></span>
                    </a>
                    <p>Advanced cyber intelligence, OSINT methodologies, and scam prevention for the digital age.</p>
                </div>
                <div class="footer-links">
                    <div>
                        <h4>Intelligence</h4>
                        <a>Latest Intel</a>
                        <a>OSINT Guide</a>
                        <a>Scam Watch</a>
                    </div>
                    <div>
                        <h4>Company</h4>
                        <a>About Us</a>
                        <a>Privacy</a>
                        <a>Terms</a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom container">
                <p>© {{ currentYear }} BharatSecurity. All frequencies secured.</p>
            </div>
        </footer>
    `,
    styleUrl: './post-preview.component.scss'
})
export class PostPreviewComponent implements OnInit {
    loading = signal(true);
    previewData: any = null;
    today = new Date();
    currentYear = new Date().getFullYear();
    scrolled = signal(false);

    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private postsService = inject(PostsService);
    private sanitizer = inject(DomSanitizer);

    @HostListener('window:scroll', [])
    onScroll(): void {
        this.scrolled.set(window.scrollY > 10);
    }

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
        if (!cat) return 'Blog';
        return cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
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

    renderContent(): SafeHtml {
        if (!this.previewData?.content?.content) return '';

        const html = this.previewData.content.content.map((node: any) => this.renderNode(node)).join('');
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }

    private renderNode(node: any): string {
        if (!node) return '';

        if (node.type === 'text') {
            let text = node.text || '';
            if (node.marks) {
                node.marks.forEach((mark: any) => {
                    // Handle both naming conventions
                    if (mark.type === 'bold' || mark.type === 'strong') text = `<strong>${text}</strong>`;
                    if (mark.type === 'italic' || mark.type === 'em') text = `<em>${text}</em>`;
                    if (mark.type === 'underline') text = `<u>${text}</u>`;
                    if (mark.type === 'strike') text = `<s>${text}</s>`;
                    if (mark.type === 'code') text = `<code>${text}</code>`;
                    if (mark.type === 'link') text = `<a href="${mark.attrs?.href}" target="_blank">${text}</a>`;
                    if (mark.type === 'textColor' || mark.type === 'text_color') text = `<span style="color:${mark.attrs?.color}">${text}</span>`;
                    if (mark.type === 'backgroundColor' || mark.type === 'background_color') text = `<span style="background-color:${mark.attrs?.color}">${text}</span>`;
                });
            }
            return text;
        }

        const children = node.content?.map((n: any) => this.renderNode(n)).join('') || '';

        switch (node.type) {
            case 'paragraph': return `<p>${children || '<br>'}</p>`;
            case 'heading':
                const level = node.attrs?.level || 2;
                return `<h${level}>${children}</h${level}>`;
            case 'bullet_list':
            case 'bulletList': return `<ul>${children}</ul>`;
            case 'ordered_list':
            case 'orderedList': return `<ol>${children}</ol>`;
            case 'list_item':
            case 'listItem': return `<li>${children}</li>`;
            case 'blockquote': return `<blockquote>${children}</blockquote>`;
            case 'code_block':
            case 'codeBlock': return `<pre><code>${children}</code></pre>`;
            case 'image':
            case 'imageBlock':
                const alignment = node.attrs?.['data-align'] || 'center';
                const alignClass = `align-${alignment}`;
                return `<figure class="post-image ${alignClass}"><img src="${node.attrs?.src}" alt="${node.attrs?.alt || ''}"/>${node.attrs?.caption ? `<figcaption>${node.attrs.caption}</figcaption>` : ''}</figure>`;
            case 'hard_break':
            case 'hardBreak': return '<br>';
            case 'horizontal_rule':
            case 'horizontalRule': return '<hr>';
            default: return children;
        }
    }

    closePreview(): void {
        window.close();
    }
}
