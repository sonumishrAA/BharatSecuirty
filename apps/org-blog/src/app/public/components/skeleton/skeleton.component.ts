import { Component } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [],
  template: `
    <div class="skeleton-card">
      <div class="skeleton-image">
        <div class="skeleton-badge"></div>
      </div>
      <div class="skeleton-body">
        <div class="skeleton-line title"></div>
        <div class="skeleton-line title w-75"></div>
        <div class="skeleton-line text mt-3"></div>
        <div class="skeleton-line text"></div>
        <div class="skeleton-footer">
          <div class="skeleton-line date"></div>
          <div class="skeleton-line btn"></div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './skeleton.component.scss'
})
export class SkeletonComponent { }
