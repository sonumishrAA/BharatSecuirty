import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PostsService } from '@core/services/posts.service';
import { Post } from '@shared/models/post.model';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
    posts = signal<Post[]>([]);
    loading = signal(true);

    constructor(
        private postsService: PostsService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.fetchPosts();
    }

    fetchPosts(): void {
        this.loading.set(true);
        this.postsService.getAll({ orderBy: 'created_at', order: 'desc' })
            .subscribe({
                next: (data) => {
                    this.posts.set(data);
                    this.loading.set(false);
                },
                error: () => {
                    this.loading.set(false);
                }
            });
    }

    toggleStatus(post: Post): void {
        // Optimistic update
        this.posts.update(posts =>
            posts.map(p => p.id === post.id
                ? { ...p, status: p.status === 'published' ? 'draft' as const : 'published' as const }
                : p
            )
        );

        this.postsService.toggleStatus(post.id).subscribe();
    }

    deletePost(id: string): void {
        if (!confirm('Delete this post permanently?')) return;

        this.posts.update(posts => posts.filter(p => p.id !== id));
        this.postsService.delete(id).subscribe();
    }

    editPost(id: string): void {
        this.router.navigate(['/admin/editor', id]);
    }
}
