import { Component, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PostsService } from '@core/services/posts.service';
import { ConfirmDialogService } from '@core/services/confirm-dialog.service';
import { ToastService } from '@core/services/toast.service';
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

    private confirmService = inject(ConfirmDialogService);
    private toast = inject(ToastService);

    constructor(
        private postsService: PostsService,
        public router: Router
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

    async deletePost(id: string): Promise<void> {
        const confirmed = await this.confirmService.confirm({
            title: 'Delete Post',
            message: 'Are you sure you want to delete this post? This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger'
        });

        if (!confirmed) return;

        this.posts.update(posts => posts.filter(p => p.id !== id));
        this.postsService.delete(id).subscribe({
            next: () => {
                this.toast.success('Post deleted successfully');
            },
            error: () => {
                this.toast.error('Failed to delete post');
                this.fetchPosts(); // Refresh on error
            }
        });
    }

    editPost(id: string): void {
        this.router.navigate(['/admin/editor', id]);
    }
}
