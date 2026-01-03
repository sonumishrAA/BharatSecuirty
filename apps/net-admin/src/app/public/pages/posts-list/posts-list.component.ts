import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PostsService } from '@core/services/posts.service';
import { Post, PostCategory } from '@shared/models/post.model';
import { BlogCardComponent } from '../../components/blog-card/blog-card.component';
import { SkeletonComponent } from '../../components/skeleton/skeleton.component';

@Component({
    selector: 'app-posts-list',
    standalone: true,
    imports: [BlogCardComponent, SkeletonComponent],
    templateUrl: './posts-list.component.html',
    styleUrl: './posts-list.component.scss'
})
export class PostsListComponent implements OnInit {
    posts = signal<Post[]>([]);
    loading = signal(true);
    type = signal<string>('blog');

    private categoryMap: Record<string, PostCategory | undefined> = {
        blog: undefined,
        osint: 'osint_guide',
        scam: 'scam_alert',
        resources: 'resource'
    };

    constructor(
        private route: ActivatedRoute,
        private postsService: PostsService
    ) { }

    ngOnInit(): void {
        this.route.data.subscribe(data => {
            this.type.set(data['type'] || 'blog');
            this.fetchPosts();
        });
    }

    fetchPosts(): void {
        this.loading.set(true);
        const category = this.categoryMap[this.type()];

        this.postsService.getPublished(category).subscribe({
            next: (data) => {
                this.posts.set(data);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
            }
        });
    }

    getTitle(): string {
        const titles: Record<string, string> = {
            blog: 'Blog',
            osint: 'OSINT Guide',
            scam: 'Scam Alerts',
            resources: 'Resources'
        };
        return titles[this.type()] || 'Blog';
    }
}
