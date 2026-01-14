import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Post, PostCategory } from '@shared/models/post.model';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-blog-card',
    standalone: true,
    imports: [RouterLink, DatePipe],
    templateUrl: './blog-card.component.html',
    styleUrl: './blog-card.component.scss'
})
export class BlogCardComponent {
    @Input({ required: true }) post!: Post;

    formatCategory(category: PostCategory): string {
        const labels: Record<PostCategory, string> = {
            'blog': 'Blog',
            'osint_guide': 'OSINT Guide',
            'scam_alert': 'Scam Alert',
            'resource': 'Resource',
            'case_studies': 'Case Study'
        };
        return labels[category] || category;
    }
}
