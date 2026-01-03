import { Component } from '@angular/core';

@Component({
    selector: 'app-skeleton',
    standalone: true,
    imports: [],
    template: `
    <div class="skeleton-card blog-card">
      <div class="skeleton-image"></div>
      <div class="skeleton-body">
        <div class="skeleton-line title"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
  `,
    styleUrl: './skeleton.component.scss'
})
export class SkeletonComponent { }
