import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-cta-card',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="cta-card" [ngClass]="type">
      <div class="icon-wrapper">
        <span class="emoji">{{ icon }}</span>
      </div>
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
      <a [href]="link" class="cta-btn">{{ buttonText }}</a>
    </div>
  `,
    styles: [`
    .cta-card {
      padding: 24px;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 24px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-4px);
      }
    }

    .icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      font-size: 24px;
    }

    h3 {
      font-size: 18px;
      font-weight: 700;
      color: white;
      margin-bottom: 8px;
    }

    p {
      font-size: 14px;
      color: #94a3b8;
      margin-bottom: 20px;
      line-height: 1.6;
    }

    .cta-btn {
      display: inline-block;
      padding: 10px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      width: 100%;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    // Variants
    .primary {
      background: linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8));
      
      .cta-btn {
        background: #6366f1;
        color: white;
        
        &:hover {
          background: #4f46e5;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
      }
    }

    .secondary {
      background: linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6));
      
      .cta-btn {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.1);

        &:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
        }
      }
    }

    .accent {
      background: linear-gradient(145deg, rgba(16, 185, 129, 0.1), rgba(6, 78, 59, 0.2));
      border-color: rgba(16, 185, 129, 0.2);

      .icon-wrapper {
        background: rgba(16, 185, 129, 0.2);
      }
      
      .cta-btn {
        background: #10b981;
        color: white;
        
        &:hover {
          background: #059669;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
      }
    }
  `]
})
export class CtaCardComponent {
    @Input() title = '';
    @Input() description = '';
    @Input() buttonText = 'Learn More';
    @Input() link = '#';
    @Input() icon = '🚀';
    @Input() type: 'primary' | 'secondary' | 'accent' = 'primary';
}
