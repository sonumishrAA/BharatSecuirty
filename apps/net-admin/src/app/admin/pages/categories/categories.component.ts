import { Component, OnInit, signal } from '@angular/core';
import { PostsService } from '@core/services/posts.service';
import { Post } from '@shared/models/post.model';
import { KeyValuePipe, TitleCasePipe } from '@angular/common'; // Added pipes

@Component({
    selector: 'app-categories',
    standalone: true,
    imports: [KeyValuePipe, TitleCasePipe], // Added pipes
    templateUrl: './categories.component.html',
    styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
    groups = signal<Record<string, Post[]>>({});
    loading = signal(true);

    constructor(private postsService: PostsService) { }

    ngOnInit(): void {
        this.fetchPosts();
    }

    fetchPosts(): void {
        this.postsService.getGroupedByCategory().subscribe({
            next: (data) => {
                this.groups.set(data);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
            }
        });
    }

    getCategoryKeys(): string[] {
        return Object.keys(this.groups());
    }
}
