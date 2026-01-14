
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, BusinessTestimonial } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-testimonials',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-header">
      <div class="header-content">
        <h1>Testimonials / Ratings</h1>
        <p>Manage client feedback and ratings shown on the homepage.</p>
      </div>
      <button class="btn-primary" (click)="toggleForm()">
        <span class="icon">{{ showForm ? '❌ Cancel' : '➕ Add Testimonial' }}</span>
      </button>
    </div>

    @if (showForm) {
      <div class="glass-panel form-panel">
        <h3>New Testimonial</h3>
        <form (ngSubmit)="saveTestimonial()" class="admin-form">
          <div class="form-group">
            <label>Client Name *</label>
            <input type="text" [(ngModel)]="newItem.client_name" name="client_name" required placeholder="e.g. John Doe">
          </div>
          
          <div class="form-group">
            <label>Company / Role</label>
            <input type="text" [(ngModel)]="newItem.company" name="company" placeholder="e.g. CEO @ TechCorp">
          </div>

          <div class="form-group">
            <label>Rating (1-5)</label>
            <select [(ngModel)]="newItem.rating" name="rating">
                <option [value]="5">⭐️⭐️⭐️⭐️⭐️ (5)</option>
                <option [value]="4">⭐️⭐️⭐️⭐️ (4)</option>
                <option [value]="3">⭐️⭐️⭐️ (3)</option>
            </select>
          </div>

          <div class="form-group full-width">
            <label>Feedback Content *</label>
            <textarea [(ngModel)]="newItem.content" name="content" required rows="3" placeholder="What did they say?"></textarea>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="!newItem.client_name || !newItem.content">Save Testimonial</button>
          </div>
        </form>
      </div>
    }

    <div class="dashboard-grid">
      @for (item of testimonials; track item.id) {
        <div class="stat-card testimonial-card">
          <div class="card-header">
            <div class="user-info">
                <h3>{{ item.client_name }}</h3>
                <span class="company">{{ item.company }}</span>
            </div>
            <div class="rating">
                {{ '⭐️'.repeat(item.rating) }}
            </div>
          </div>
          <p class="content">"{{ item.content }}"</p>
          <div class="actions">
            <button class="btn-danger-sm" (click)="deleteItem(item.id!)">🗑️ Delete</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .glass-panel { background: rgba(255, 255, 255, 0.05); padding: 2rem; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 2rem; }
    .admin-form { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .full-width { grid-column: 1 / -1; }
    input, select, textarea { width: 100%; padding: 0.8rem; background: rgba(0,0,0,0.3); border: 1px solid #334155; color: white; border-radius: 6px; }
    .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
    .testimonial-card { background: #1e293b; padding: 1.5rem; border-radius: 8px; border: 1px solid #334155; }
    .card-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
    .company { display: block; font-size: 0.85rem; color: #94a3b8; }
    .content { font-style: italic; color: #cbd5e1; line-height: 1.5; margin-bottom: 1.5rem; }
    .btn-primary { background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
    .btn-danger-sm { background: #ef4444; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
  `]
})
export class TestimonialsComponent implements OnInit {
  adminService: AdminService = inject(AdminService);
  testimonials: BusinessTestimonial[] = [];
  showForm = false;

  newItem: BusinessTestimonial = {
    client_name: '',
    company: '',
    rating: 5,
    content: ''
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.adminService.getTestimonials().subscribe((data: BusinessTestimonial[]) => {
      this.testimonials = data;
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  saveTestimonial() {
    if (!this.newItem.client_name || !this.newItem.content) return;

    this.adminService.createTestimonial(this.newItem).subscribe({
      next: (res: BusinessTestimonial) => {
        this.testimonials.unshift(res); // Add to top
        this.showForm = false;
        this.newItem = { client_name: '', company: '', rating: 5, content: '' }; // Reset
      },
      error: (err: any) => console.error('Failed to create:', err)
    });
  }

  deleteItem(id: string) {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      this.adminService.deleteTestimonial(id).subscribe({
        next: () => {
          this.testimonials = this.testimonials.filter(t => t.id !== id);
        }
      });
    }
  }
}
