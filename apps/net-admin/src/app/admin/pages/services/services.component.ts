import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, BusinessService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {
  services = signal<BusinessService[]>([]);
  loading = signal(true);
  showForm = false;
  isEditMode = false;
  editingServiceId: string | null = null;

  // Service form
  serviceForm: BusinessService = {
    title: '',
    description: '',
    icon: 'security',
    features: [],
    status: 'active'
  };
  featureInput = '';

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.loading.set(true);
    this.adminService.getAllServices().subscribe({
      next: (data) => {
        this.services.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load services', err);
        this.loading.set(false);
      }
    });
  }

  openAddForm() {
    this.isEditMode = false;
    this.editingServiceId = null;
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(service: BusinessService) {
    this.isEditMode = true;
    this.editingServiceId = service.id || null;
    this.serviceForm = {
      title: service.title,
      description: service.description,
      icon: service.icon,
      features: [...(service.features || [])],
      status: service.status
    };
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.resetForm();
  }

  addFeature() {
    if (this.featureInput.trim()) {
      this.serviceForm.features = [...(this.serviceForm.features || []), this.featureInput.trim()];
      this.featureInput = '';
    }
  }

  removeFeature(index: number) {
    this.serviceForm.features = this.serviceForm.features?.filter((_, i) => i !== index);
  }

  submitForm() {
    if (!this.serviceForm.title || !this.serviceForm.description) {
      alert('Please fill in title and description');
      return;
    }

    if (this.isEditMode && this.editingServiceId) {
      // Update existing
      this.adminService.updateService(this.editingServiceId, this.serviceForm).subscribe({
        next: (updated) => {
          this.services.update(list => list.map(s => s.id === updated.id ? updated : s));
          this.closeForm();
        },
        error: (err) => {
          console.error('Failed to update service', err);
          alert('Failed to update service');
        }
      });
    } else {
      // Create new
      this.adminService.createService(this.serviceForm).subscribe({
        next: (created) => {
          this.services.update(list => [created, ...list]);
          this.closeForm();
        },
        error: (err) => {
          console.error('Failed to create service', err);
          alert('Failed to create service');
        }
      });
    }
  }

  resetForm() {
    this.serviceForm = {
      title: '',
      description: '',
      icon: 'security',
      features: [],
      status: 'active'
    };
    this.featureInput = '';
    this.isEditMode = false;
    this.editingServiceId = null;
  }
}
