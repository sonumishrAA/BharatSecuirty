import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Post } from '@shared/models/post.model';
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
}
