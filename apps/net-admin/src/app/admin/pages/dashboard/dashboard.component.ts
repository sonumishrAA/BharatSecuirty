import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService, Booking, BusinessService } from '../../../core/services/admin.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
    bookings = signal<Booking[]>([]);
    services = signal<BusinessService[]>([]);
    loading = signal(true);

    constructor(
        private adminService: AdminService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.fetchData();
    }

    fetchData(): void {
        this.loading.set(true);
        // ForkJoin could be better but simplified here
        this.adminService.getBookings().subscribe({
            next: (data) => {
                this.bookings.set(data);
                this.adminService.getAllServices().subscribe({
                    next: (services) => {
                        this.services.set(services);
                        this.loading.set(false);
                    }
                });
            },
            error: () => {
                this.loading.set(false);
            }
        });
    }

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    get recentBookings() {
        return this.bookings().slice(0, 5);
    }
}
