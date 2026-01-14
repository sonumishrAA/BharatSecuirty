import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ClientService, Booking } from '../../core/services/client.service';
import { environment } from '@environments';

interface Message {
    id: string;
    sender_role: string;
    content: string;
    attachment_url?: string;
    created_at: string;
}

interface StatusHistory {
    id: string;
    old_status: string;
    new_status: string;
    notes?: string;
    created_at: string;
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    bookings: Booking[] = [];
    isLoading = true;
    selectedBooking: Booking | null = null;
    messages: Message[] = [];
    statusHistory: StatusHistory[] = [];
    chatMessage = '';
    selectedFile: File | null = null;

    get user() {
        return this.auth.currentUser;
    }

    constructor(
        private auth: AuthService,
        private clientService: ClientService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        if (this.auth.currentUser?.must_change_password) {
            this.router.navigate(['/change-password']);
            return;
        }
        this.loadBookings();
    }

    loadBookings() {
        console.log('loadBookings called');
        this.isLoading = true;
        this.clientService.getMyBookings()
            .pipe(
                timeout(5000),
                finalize(() => {
                    console.log('Finalize called - stopping spinner');
                    this.isLoading = false;
                    this.cdr.detectChanges(); // Force UI update
                })
            )
            .subscribe({
                next: (data) => {
                    console.log('Bookings loaded:', data);
                    this.bookings = data;
                    if (data.length > 0) {
                        this.selectBooking(data[0]);
                    }
                },
                error: (err) => {
                    console.error('Failed to load bookings:', err);
                    if (err.name === 'TimeoutError') {
                        console.error('Request timed out!');
                    }
                    if (err.status === 401) {
                        this.auth.logout();
                    }
                }
            });
    }

    selectBooking(booking: Booking) {
        this.selectedBooking = booking;
        this.loadMessages(booking.id);
        this.loadHistory(booking.id);
    }

    loadMessages(bookingId: string) {
        this.clientService.getMessages(bookingId).subscribe({
            next: (data) => {
                this.messages = data || [];
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Failed to load messages', err)
        });
    }

    getAttachmentUrl(path: string): string {
        if (!path) return '';
        const baseUrl = environment.apiUrl.replace(/\/api$/, '');
        return `${baseUrl}${path}`;
    }

    loadHistory(bookingId: string) {
        this.clientService.getStatusHistory(bookingId).subscribe({
            next: (data) => this.statusHistory = data,
            error: (err) => console.error('Failed to load history', err)
        });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
        }
    }

    sendMessage() {
        if (!this.selectedBooking || (!this.chatMessage.trim() && !this.selectedFile)) return;
        this.clientService.sendMessage(this.selectedBooking.id, this.chatMessage, this.selectedFile || undefined).subscribe({
            next: () => {
                this.loadMessages(this.selectedBooking!.id);
                this.chatMessage = '';
                this.selectedFile = null;
            },
            error: (err) => console.error('Failed to send message', err)
        });
    }

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    }

    formatDateTime(dateStr: string): string {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }

    getStatusIcon(status: string): string {
        const icons: Record<string, string> = {
            'pending': '⏳', 'in_progress': '🔄', 'under_review': '🔍',
            'waiting_client': '⏸️', 'completed': '✅', 'cancelled': '❌'
        };
        return icons[status] || '📋';
    }

    logout() {
        this.auth.logout();
    }
}
