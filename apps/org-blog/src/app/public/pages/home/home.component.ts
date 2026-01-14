import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostsService } from '@core/services/posts.service';
import { ToastService } from '@core/services/toast.service';
import { Post, PostCategory } from '@shared/models/post.model';
import { BlogCardComponent } from '../../components/blog-card/blog-card.component';
import { SkeletonComponent } from '../../components/skeleton/skeleton.component';

interface CategoryTab {
  label: string;
  value: PostCategory | 'all';
}

import { CommonModule, DatePipe } from '@angular/common';
// RouterLink already imported from @angular/router

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BlogCardComponent, SkeletonComponent, FormsModule, RouterLink, CommonModule, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  // Category tabs with colors
  categories: (CategoryTab & { color: string })[] = [
    // 'All' is handled manually in template
    { label: 'Blog', value: 'blog', color: '#8b5cf6' },
    { label: 'OSINT Guide', value: 'osint_guide', color: '#10b981' },
    { label: 'Scam Alert', value: 'scam_alert', color: '#ef4444' },
    { label: 'Resources', value: 'resource', color: '#f59e0b' }
  ];

  selectedCategory = signal<PostCategory | 'all'>('all');
  activeCategory = this.selectedCategory; // Alias for template compatibility

  // Posts data
  allPosts = signal<Post[]>([]);
  filteredPosts = signal<Post[]>([]);
  featuredPosts = signal<Post[]>([]);
  currentFeaturedIndex = signal(0);
  loading = signal(true);

  // Pagination
  currentPage = signal(1);
  postsPerPage = 9;
  totalPages = signal(1);

  // Subscription
  email = '';

  private postsService = inject(PostsService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private sliderInterval: any;

  ngOnInit(): void {
    this.fetchPosts();

    // Listen to query params for category filtering
    this.route.queryParams.subscribe(params => {
      const category = params['category'];
      if (category && this.isValidCategory(category)) {
        this.filterCategory(category as PostCategory);
      } else {
        // Optional: reset to 'all' if no valid category, but maybe unnecessary if we want to keep state
        // currently defaulting to 'all' on init
      }
    });

    this.startSlider();
  }

  ngOnDestroy(): void {
    this.stopSlider();
  }

  fetchPosts(): void {
    this.loading.set(true);
    this.postsService.getPublished(undefined, 100).subscribe({
      next: (posts) => {
        this.allPosts.set(posts);

        // Set top 5 posts as featured
        if (posts.length > 0) {
          this.featuredPosts.set(posts.slice(0, 5));
        }

        this.applyFilter();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  startSlider(): void {
    this.stopSlider();
    this.sliderInterval = setInterval(() => {
      this.nextFeatured();
    }, 5000); // 5 seconds
  }

  stopSlider(): void {
    if (this.sliderInterval) {
      clearInterval(this.sliderInterval);
    }
  }

  nextFeatured(): void {
    this.currentFeaturedIndex.update(i => (i + 1) % this.featuredPosts().length);
  }

  prevFeatured(): void {
    this.currentFeaturedIndex.update(i => (i - 1 + this.featuredPosts().length) % this.featuredPosts().length);
  }

  setFeatured(index: number): void {
    this.currentFeaturedIndex.set(index);
    this.startSlider(); // Reset timer on manual interaction
  }

  filterCategory(category: PostCategory | 'all'): void {
    this.selectedCategory.set(category);
    this.currentPage.set(1);
    this.applyFilter();
  }

  applyFilter(): void {
    const category = this.selectedCategory();
    let filtered: Post[];

    if (category === 'all') {
      filtered = this.allPosts();
    } else {
      filtered = this.allPosts().filter(post => post.category === category);
    }

    this.filteredPosts.set(filtered);
    this.totalPages.set(Math.ceil(filtered.length / this.postsPerPage) || 1);
  }

  get paginatedPosts(): Post[] {
    const start = (this.currentPage() - 1) * this.postsPerPage;
    const end = start + this.postsPerPage;
    return this.filteredPosts().slice(start, end);
  }

  get pageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      if (i > 0) pages.push(i);
    }

    return pages;
  }

  // Alias for template
  pagesArray = () => this.pageNumbers;

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) this.goToPage(this.currentPage() - 1);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) this.goToPage(this.currentPage() + 1);
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

  formatCategory(category: string): string {
    return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  isValidCategory(cat: string): boolean {
    return ['blog', 'osint_guide', 'scam_alert', 'resource', 'all'].includes(cat);
  }
}
