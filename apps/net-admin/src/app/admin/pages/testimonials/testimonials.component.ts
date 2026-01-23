
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
        <h1>Testimonials</h1>
        <p>Manage client feedback and ratings shown on the homepage.</p>
      </div>
      <button class="btn-primary" (click)="toggleForm()">
        <span class="icon">{{ showForm ? '✕' : '+' }}</span>
        <span>{{ showForm ? 'Cancel' : 'Add Testimonial' }}</span>
      </button>
    </div>

    @if (showForm) {
      <div class="glass-panel form-panel">
        <h3>{{ editingId ? 'Edit Testimonial' : 'New Testimonial' }}</h3>
        <form (ngSubmit)="saveTestimonial()" class="admin-form">
          <div class="form-row">
            <div class="form-group">
              <label>Client Name *</label>
              <input type="text" [(ngModel)]="formData.client_name" name="client_name" required placeholder="e.g. John Doe">
            </div>
            
            <div class="form-group">
              <label>Company / Role</label>
              <input type="text" [(ngModel)]="formData.company" name="company" placeholder="e.g. CEO @ TechCorp">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Rating</label>
              <div class="rating-select">
                @for (star of [1,2,3,4,5]; track star) {
                  <button type="button" 
                    class="star-btn" 
                    [class.active]="star <= formData.rating" 
                    (click)="formData.rating = star">
                    ★
                  </button>
                }
              </div>
            </div>

            <div class="form-group">
              <label>Avatar Image URL</label>
              <input type="url" [(ngModel)]="formData.avatar_url" name="avatar_url" placeholder="https://example.com/avatar.jpg">
            </div>
          </div>

          <div class="form-group full-width">
            <label>Feedback Content *</label>
            <textarea [(ngModel)]="formData.content" name="content" required rows="4" placeholder="What did they say about your services?"></textarea>
          </div>

          <!-- Preview Card -->
          @if (formData.client_name || formData.content) {
            <div class="preview-section">
              <label>Preview</label>
              <div class="preview-card">
                <div class="preview-rating">
                  @for (star of [1,2,3,4,5]; track star) {
                    <span class="preview-star" [class.filled]="star <= formData.rating">★</span>
                  }
                </div>
                <p class="preview-content">"{{ formData.content || 'Your testimonial content...' }}"</p>
                <div class="preview-author">
                  <div class="preview-avatar">{{ getInitials(formData.client_name || 'AB') }}</div>
                  <div class="preview-info">
                    <span class="preview-name">{{ formData.client_name || 'Client Name' }}</span>
                    <span class="preview-company">{{ formData.company || 'Company' }}</span>
                  </div>
                </div>
              </div>
            </div>
          }

          <div class="form-actions">
            @if (editingId) {
              <button type="button" class="btn-secondary" (click)="cancelEdit()">Cancel</button>
            }
            <button type="submit" class="btn-primary" [disabled]="!formData.client_name || !formData.content">
              {{ editingId ? 'Update' : 'Save' }} Testimonial
            </button>
          </div>
        </form>
      </div>
    }

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-mini">
        <span class="stat-number">{{ testimonials.length }}</span>
        <span class="stat-label">Total Testimonials</span>
      </div>
      <div class="stat-mini">
        <span class="stat-number">{{ getAverageRating() }}</span>
        <span class="stat-label">Avg. Rating</span>
      </div>
    </div>

    <div class="dashboard-grid">
      @for (item of testimonials; track item.id) {
        <div class="testimonial-card">
          <div class="card-header">
            <div class="user-info">
              <div class="avatar">{{ getInitials(item.client_name) }}</div>
              <div class="user-details">
                <h3>{{ item.client_name }}</h3>
                <span class="company">{{ item.company }}</span>
              </div>
            </div>
            <div class="rating">
              @for (star of [1,2,3,4,5]; track star) {
                <span class="star" [class.filled]="star <= item.rating">★</span>
              }
            </div>
          </div>
          <p class="content">"{{ item.content }}"</p>
          <div class="card-footer">
            <span class="date">{{ item.created_at | date:'mediumDate' }}</span>
            <div class="actions">
              <button class="btn-edit" (click)="editItem(item)">✏️ Edit</button>
              <button class="btn-danger-sm" (click)="deleteItem(item.id!)">🗑️ Delete</button>
            </div>
          </div>
        </div>
      } @empty {
        <div class="empty-state">
          <span class="empty-icon">💬</span>
          <h3>No Testimonials Yet</h3>
          <p>Add your first client testimonial to showcase on the homepage.</p>
          <button class="btn-primary" (click)="toggleForm()">+ Add Testimonial</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 2rem; 
    }
    .header-content h1 { margin: 0 0 0.5rem; color: #f1f5f9; }
    .header-content p { margin: 0; color: #94a3b8; }
    
    .glass-panel { 
      background: rgba(255, 255, 255, 0.03); 
      padding: 2rem; 
      border-radius: 16px; 
      border: 1px solid rgba(255, 255, 255, 0.08); 
      margin-bottom: 2rem;
      backdrop-filter: blur(10px);
    }
    .glass-panel h3 { margin: 0 0 1.5rem; color: #f1f5f9; font-size: 1.25rem; }
    
    .admin-form { display: flex; flex-direction: column; gap: 1.5rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-group label { color: #94a3b8; font-size: 0.875rem; font-weight: 500; }
    .full-width { grid-column: 1 / -1; }
    
    input, select, textarea { 
      width: 100%; 
      padding: 0.875rem 1rem; 
      background: rgba(0,0,0,0.3); 
      border: 1px solid #334155; 
      color: white; 
      border-radius: 8px;
      font-size: 0.95rem;
      transition: all 0.2s;
    }
    input:focus, textarea:focus {
      outline: none;
      border-color: #00f0ff;
      box-shadow: 0 0 0 3px rgba(0, 240, 255, 0.1);
    }
    textarea { resize: vertical; min-height: 100px; }
    
    .rating-select {
      display: flex;
      gap: 0.5rem;
    }
    .star-btn {
      background: transparent;
      border: none;
      font-size: 28px;
      cursor: pointer;
      color: #334155;
      transition: all 0.2s;
      padding: 0.25rem;
    }
    .star-btn:hover, .star-btn.active {
      color: #fbbf24;
      transform: scale(1.1);
    }
    
    .preview-section {
      background: rgba(0, 240, 255, 0.05);
      padding: 1.5rem;
      border-radius: 12px;
      border: 1px dashed rgba(0, 240, 255, 0.2);
    }
    .preview-section > label { display: block; margin-bottom: 1rem; color: #00f0ff; }
    .preview-card {
      background: rgba(255, 255, 255, 0.03);
      padding: 1.25rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .preview-rating { margin-bottom: 0.75rem; }
    .preview-star { color: #334155; font-size: 16px; }
    .preview-star.filled { color: #fbbf24; }
    .preview-content { 
      color: #cbd5e1; 
      font-style: italic; 
      line-height: 1.6; 
      margin: 0 0 1rem;
    }
    .preview-author { display: flex; align-items: center; gap: 0.75rem; }
    .preview-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(43, 89, 255, 0.2));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #00f0ff;
      font-weight: 600;
      font-size: 0.875rem;
    }
    .preview-info { display: flex; flex-direction: column; }
    .preview-name { color: #f1f5f9; font-weight: 600; font-size: 0.875rem; }
    .preview-company { color: #64748b; font-size: 0.75rem; }
    
    .form-actions { 
      display: flex; 
      justify-content: flex-end; 
      gap: 1rem; 
      margin-top: 0.5rem;
    }
    
    .stats-row {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .stat-mini {
      background: rgba(255, 255, 255, 0.03);
      padding: 1.25rem 2rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .stat-number { font-size: 1.75rem; font-weight: 700; color: #00f0ff; }
    .stat-label { font-size: 0.875rem; color: #64748b; }
    
    .dashboard-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); 
      gap: 1.5rem; 
    }
    
    .testimonial-card { 
      background: rgba(255, 255, 255, 0.03);
      padding: 1.5rem; 
      border-radius: 12px; 
      border: 1px solid rgba(255, 255, 255, 0.08);
      transition: all 0.3s;
    }
    .testimonial-card:hover {
      border-color: rgba(0, 240, 255, 0.3);
      transform: translateY(-2px);
    }
    
    .card-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start;
      margin-bottom: 1rem; 
    }
    .user-info { display: flex; align-items: center; gap: 0.75rem; }
    .avatar {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(43, 89, 255, 0.2));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #00f0ff;
      font-weight: 700;
      font-size: 1rem;
    }
    .user-details h3 { margin: 0; color: #f1f5f9; font-size: 1rem; }
    .company { display: block; font-size: 0.85rem; color: #64748b; }
    
    .rating { display: flex; gap: 2px; }
    .star { color: #334155; font-size: 16px; }
    .star.filled { color: #fbbf24; }
    
    .content { 
      font-style: italic; 
      color: #94a3b8; 
      line-height: 1.6; 
      margin: 0 0 1.25rem;
    }
    
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    .date { font-size: 0.8rem; color: #64748b; }
    .actions { display: flex; gap: 0.5rem; }
    
    .btn-primary { 
      background: linear-gradient(135deg, #00f0ff, #2b59ff);
      color: #0a0a0f; 
      border: none; 
      padding: 0.75rem 1.5rem; 
      border-radius: 8px; 
      cursor: pointer; 
      display: flex; 
      align-items: center; 
      gap: 0.5rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0, 240, 255, 0.3); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    
    .btn-secondary {
      background: transparent;
      color: #94a3b8;
      border: 1px solid #334155;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }
    .btn-secondary:hover { border-color: #64748b; color: #f1f5f9; }
    
    .btn-edit {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
      border: 1px solid rgba(59, 130, 246, 0.3);
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s;
    }
    .btn-edit:hover { background: rgba(59, 130, 246, 0.2); }
    
    .btn-danger-sm { 
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444; 
      border: 1px solid rgba(239, 68, 68, 0.3);
      padding: 0.4rem 0.75rem; 
      border-radius: 6px; 
      cursor: pointer; 
      font-size: 0.8rem;
      transition: all 0.2s;
    }
    .btn-danger-sm:hover { background: rgba(239, 68, 68, 0.2); }
    
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 2rem;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 16px;
      border: 1px dashed rgba(255, 255, 255, 0.1);
    }
    .empty-icon { font-size: 48px; display: block; margin-bottom: 1rem; }
    .empty-state h3 { margin: 0 0 0.5rem; color: #f1f5f9; }
    .empty-state p { margin: 0 0 1.5rem; color: #64748b; }

    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; }
      .admin-header { flex-direction: column; gap: 1rem; align-items: stretch; }
      .stats-row { flex-direction: column; }
    }
  `]
})
export class TestimonialsComponent implements OnInit {
  adminService: AdminService = inject(AdminService);
  testimonials: BusinessTestimonial[] = [];
  showForm = false;
  editingId: string | null = null;

  formData: BusinessTestimonial = {
    client_name: '',
    company: '',
    rating: 5,
    content: '',
    avatar_url: ''
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
    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.formData = { client_name: '', company: '', rating: 5, content: '', avatar_url: '' };
    this.editingId = null;
  }

  saveTestimonial() {
    if (!this.formData.client_name || !this.formData.content) return;

    if (this.editingId) {
      // Update existing
      this.adminService.updateTestimonial(this.editingId, this.formData).subscribe({
        next: (res: BusinessTestimonial) => {
          const index = this.testimonials.findIndex(t => t.id === this.editingId);
          if (index !== -1) {
            this.testimonials[index] = res;
          }
          this.showForm = false;
          this.resetForm();
        },
        error: (err: any) => console.error('Failed to update:', err)
      });
    } else {
      // Create new
      this.adminService.createTestimonial(this.formData).subscribe({
        next: (res: BusinessTestimonial) => {
          this.testimonials.unshift(res);
          this.showForm = false;
          this.resetForm();
        },
        error: (err: any) => console.error('Failed to create:', err)
      });
    }
  }

  editItem(item: BusinessTestimonial) {
    this.editingId = item.id!;
    this.formData = { ...item };
    this.showForm = true;
  }

  cancelEdit() {
    this.resetForm();
    this.showForm = false;
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

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getAverageRating(): string {
    if (this.testimonials.length === 0) return '0';
    const sum = this.testimonials.reduce((acc, t) => acc + t.rating, 0);
    return (sum / this.testimonials.length).toFixed(1);
  }
}
