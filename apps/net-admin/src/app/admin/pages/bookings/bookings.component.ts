import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, Booking } from '../../../core/services/admin.service';

@Component({
    selector: 'app-bookings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './bookings.component.html',
    styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements OnInit {
    bookings: Booking[] = [];
    isLoading = true;
    selectedBooking: Booking | null = null;
    selectedIds: Set<string> = new Set();
    selectAll = false;

    constructor(private adminService: AdminService) { }

    ngOnInit() {
        this.loadBookings();
    }

    loadBookings() {
        this.isLoading = true;
        this.selectedIds.clear();
        this.selectAll = false;
        this.adminService.getBookings().subscribe({
            next: (data) => {
                this.bookings = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to load bookings', err);
                this.isLoading = false;
            }
        });
    }

    // Selection
    toggleSelectAll() {
        if (this.selectAll) {
            this.bookings.forEach(b => this.selectedIds.add(b.id));
        } else {
            this.selectedIds.clear();
        }
    }

    toggleSelection(id: string) {
        if (this.selectedIds.has(id)) {
            this.selectedIds.delete(id);
        } else {
            this.selectedIds.add(id);
        }
        this.selectAll = this.selectedIds.size === this.bookings.length;
    }

    isSelected(id: string): boolean {
        return this.selectedIds.has(id);
    }

    get selectedCount(): number {
        return this.selectedIds.size;
    }

    // Delete
    deleteBooking(id: string) {
        if (!confirm('Are you sure you want to delete this booking?')) return;
        this.adminService.deleteBooking(id).subscribe({
            next: () => {
                this.bookings = this.bookings.filter(b => b.id !== id);
                this.selectedIds.delete(id);
            },
            error: (err) => console.error('Delete failed', err)
        });
    }

    bulkDelete() {
        if (this.selectedIds.size === 0) return;
        if (!confirm(`Delete ${this.selectedIds.size} selected booking(s)?`)) return;

        const ids = Array.from(this.selectedIds);
        this.adminService.bulkDeleteBookings(ids).subscribe({
            next: () => {
                this.bookings = this.bookings.filter(b => !this.selectedIds.has(b.id));
                this.selectedIds.clear();
                this.selectAll = false;
            },
            error: (err) => console.error('Bulk delete failed', err)
        });
    }

    // Export
    exportCSV() {
        const headers = ['Date', 'Name', 'Email', 'Company', 'Phone', 'Service', 'Message', 'Status'];
        const rows = this.bookings.map(b => [
            this.formatDate(b.created_at),
            b.contact_name,
            b.contact_email,
            b.company || '',
            b.phone || '',
            b.service_type || b.service_title || '',
            (b.message || '').replace(/\n/g, ' '),
            b.status || 'pending'
        ]);

        const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    viewDetails(booking: Booking) {
        this.selectedBooking = booking;
    }

    closeDetails() {
        this.selectedBooking = null;
    }

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getAttachmentName(url?: string): string {
        if (!url) return '';
        return url.split('/').pop() || 'File';
    }
}
