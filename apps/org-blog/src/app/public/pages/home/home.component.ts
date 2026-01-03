import { Component, OnInit, signal, Input, AfterViewInit, ElementRef, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PostsService } from '@core/services/posts.service';
import { ToastService } from '@core/services/toast.service';
import { Post, PostCategory } from '@shared/models/post.model';
import { BlogCardComponent } from '../../components/blog-card/blog-card.component';
import { SkeletonComponent } from '../../components/skeleton/skeleton.component';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-horizontal-section',
  standalone: true,
  imports: [BlogCardComponent, SkeletonComponent],
  template: `
    <section class="home-section" #section>
      <div class="container">
        <h2 class="section-title">{{ title }}</h2>

        <div class="horizontal-scroll" #scrollContainer>
          @if (loading()) {
            @for (i of [1,2,3,4]; track i) {
              <app-skeleton></app-skeleton>
            }
          }

          @if (!loading()) {
            @for (post of posts(); track post.id) {
              <div class="card-wrapper">
                <app-blog-card [post]="post"></app-blog-card>
              </div>
            }
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .home-section { padding: 60px 0; opacity: 0; visibility: hidden; } /* Hidden initially for animation */
    .section-title { font-size: 26px; margin-bottom: 20px; }
    .horizontal-scroll {
      display: flex;
      gap: 24px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding-bottom: 8px;
    }
    .horizontal-scroll::-webkit-scrollbar { display: none; }
    .card-wrapper {
      min-width: 300px;
      max-width: 300px;
      scroll-snap-align: start;
    }
    .horizontal-scroll ::ng-deep app-skeleton > * {
      min-width: 300px;
      max-width: 300px;
      scroll-snap-align: start;
    }
  `]
})
export class HorizontalSectionComponent implements OnInit {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) type!: 'blog' | 'osint' | 'scam' | 'resources';
  @ViewChild('section') sectionRef!: ElementRef;
  @ViewChild('scrollContainer') scrollRef!: ElementRef;

  posts = signal<Post[]>([]);
  loading = signal(true);

  private categoryMap: Record<string, PostCategory | undefined> = {
    blog: undefined, // all categories for blog
    osint: 'osint_guide',
    scam: 'scam_alert',
    resources: 'resource'
  };

  constructor(private postsService: PostsService) { }

  ngOnInit(): void {
    this.fetchPosts();
  }

  fetchPosts(): void {
    const category = this.categoryMap[this.type];

    this.postsService.getPublished(category, 10).subscribe({
      next: (data) => {
        this.posts.set(data);
        this.loading.set(false);
        // Trigger animation after render
        setTimeout(() => this.animateEntrance(), 100);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  private animateEntrance(): void {
    const section = this.sectionRef.nativeElement;
    const cards = this.scrollRef.nativeElement.querySelectorAll('.card-wrapper');

    gsap.to(section, { autoAlpha: 1, duration: 0.5 });

    gsap.fromTo(cards,
      { x: 50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%'
        }
      }
    );
  }
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HorizontalSectionComponent, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  sections = [
    { title: 'Latest Blogs', type: 'blog' as const },
    { title: 'OSINT Guides', type: 'osint' as const },
    { title: 'Scam Alerts', type: 'scam' as const },
    { title: 'Resources', type: 'resources' as const }
  ];

  private toast = inject(ToastService);
  newsletterEmail = '';

  subscribeNewsletter(): void {
    if (this.newsletterEmail) {
      this.toast.success(`Thanks for subscribing with ${this.newsletterEmail}!`);
      this.newsletterEmail = '';
    }
  }
}
