import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';

interface StatusHistory {
    id: string;
    old_status: string;
    new_status: string;
    notes?: string;
    changed_by_email: string;
    created_at: string;
}

interface Message {
    id: string;
    sender_role: string;
    sender_email: string;
    content: string;
    attachment_url?: string;
    created_at: string;
}

@Component({
    selector: 'app-user-detail',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './user-detail.component.html',
    styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {
    userId: string = '';
    user: any = null;
    statusHistory: StatusHistory[] = [];
    messages: Message[] = [];
    isLoading = true;

    // Status update form
    selectedBookingId: string | null = null;
    newStatus = '';
    newProgress = 0;
    statusNotes = '';

    // Chat form
    chatBookingId: string | null = null;
    chatMessage = '';
    selectedFile: File | null = null;

    statusOptions = [
        { value: 'pending', label: '⏳ Pending', color: '#fef3c7' },
        { value: 'in_progress', label: '🔄 In Progress', color: '#dbeafe' },
        { value: 'under_review', label: '🔍 Under Review', color: '#e9d5ff' },
        { value: 'waiting_client', label: '⏸️ Waiting for Client', color: '#fed7aa' },
        { value: 'completed', label: '✅ Completed', color: '#dcfce7' },
        { value: 'cancelled', label: '❌ Cancelled', color: '#fee2e2' }
    ];

    // User Edit State
    isEditingUser = false;
    editEmail = '';
    editPassword = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private adminService: AdminService
    ) { }

    ngOnInit() {
        this.userId = this.route.snapshot.paramMap.get('id') || '';
        console.log('INIT UserDetail, userId:', this.userId);
        this.loadUserDetails();

        // Auto-open edit mode if requested
        this.route.queryParams.subscribe(params => {
            console.log('Query Params changed:', params);
            if (params['edit'] === 'true') {
                console.log('Auto-opening edit mode');
                this.isEditingUser = true;
            }
        });
    }

    loadUserDetails() {
        this.isLoading = true;
        this.adminService.getUserDetails(this.userId).subscribe({
            next: (data) => {
                this.user = data;
                this.isLoading = false;
                this.editEmail = data.email;
                // Load history for first booking if exists
                if (data.bookings?.length > 0) {
                    this.loadStatusHistory(data.bookings[0].id);
                    this.loadMessages(data.bookings[0].id);
                }
            },
            error: (err) => {
                console.error('Failed to load user', err);
                this.isLoading = false;
            }
        });
    }

    // User Management Actions
    toggleEditUser() {
        this.isEditingUser = !this.isEditingUser;
        this.editPassword = ''; // Reset password field
    }

    saveUserCredentials() {
        if (!confirm('Are you sure you want to update these credentials?')) return;

        const updates: any = {};
        if (this.editEmail !== this.user.email) updates.email = this.editEmail;
        if (this.editPassword) updates.password = this.editPassword;

        if (Object.keys(updates).length === 0) {
            this.isEditingUser = false;
            return;
        }

        console.log('Updating credentials with:', updates);

        this.adminService.updateUserCredentials(this.userId, updates).subscribe({
            next: () => {
                alert('User credentials updated successfully');
                this.isEditingUser = false;
                this.loadUserDetails();
            },
            error: (err) => {
                console.error('Failed to update credentials', err);
                alert('Failed to update credentials');
            }
        });
    }

    deleteUser() {
        if (!confirm('DANGER: Are you sure you want to DELETE THIS USER? \n\nThis will permanently delete:\n- The user account\n- ALL their bookings\n- ALL chat history\n\nThis action cannot be undone.')) return;

        this.adminService.deleteUser(this.userId).subscribe({
            next: () => {
                alert('User deleted successfully');
                this.router.navigate(['/admin/users']);
            },
            error: (err) => {
                console.error('Failed to delete user', err);
                alert('Failed to delete user');
            }
        });
    }

    loadStatusHistory(bookingId: string) {
        this.selectedBookingId = bookingId;

        // Find the booking and update the form state
        if (this.user && this.user.bookings) {
            const booking = this.user.bookings.find((b: any) => b.id === bookingId);
            if (booking) {
                this.newStatus = booking.status;
                this.newProgress = booking.progress || 0;
            }
        }

        this.adminService.getStatusHistory(bookingId).subscribe({
            next: (data) => this.statusHistory = data,
            error: (err) => console.error('Failed to load history', err)
        });
    }

    deleteBooking(bookingId: string) {
        if (confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
            this.adminService.deleteBooking(bookingId).subscribe({
                next: () => {
                    // Reload user details or go back if no bookings left
                    this.loadUserDetails();
                    // If current selection is deleted, clear it
                    if (this.selectedBookingId === bookingId) {
                        this.selectedBookingId = null;
                        this.statusHistory = [];
                        this.messages = [];
                    }
                },
                error: (err) => console.error('Failed to delete booking', err)
            });
        }
    }

    loadMessages(bookingId: string) {
        this.chatBookingId = bookingId;
        this.adminService.getMessages(bookingId).subscribe({
            next: (data) => this.messages = data,
            error: (err) => console.error('Failed to load messages', err)
        });
    }

    updateStatus() {
        if (!this.selectedBookingId || !this.newStatus) return;

        this.adminService.updateBookingStatus(this.selectedBookingId, {
            status: this.newStatus,
            progress: this.newProgress,
            notes: this.statusNotes
        }).subscribe({
            next: () => {
                this.loadUserDetails();
                this.loadStatusHistory(this.selectedBookingId!);
                this.newStatus = '';
                this.statusNotes = '';
            },
            error: (err) => console.error('Failed to update status', err)
        });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
        }
    }

    sendMessage() {
        console.log('UserDetail.sendMessage called. ChatBookingId:', this.chatBookingId, 'Message:', this.chatMessage, 'File:', this.selectedFile);

        if (!this.chatBookingId || (!this.chatMessage.trim() && !this.selectedFile)) {
            console.warn('Cannot send message: Missing ID or content');
            return;
        }

        this.adminService.sendMessage(this.chatBookingId, this.chatMessage, this.selectedFile || undefined).subscribe({
            next: () => {
                console.log('Message sent successfully');
                this.loadMessages(this.chatBookingId!);
                this.chatMessage = '';
                this.selectedFile = null;
                // Reset file input manually if needed via ViewChild, but simplistic approach for now
                // Attempt to reset input value
                const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            },
            error: (err) => console.error('Failed to send message', err)
        });
    }

    goBack() {
        this.router.navigate(['/admin/users']);
    }

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString();
    }

    formatDateTime(dateStr: string): string {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
        });
    }

    getAttachmentUrl(path: string): string {
        if (!path) return '';
        return `http://localhost:3000${path}`;
    }

    getStatusIcon(status: string): string {
        const icons: Record<string, string> = {
            'pending': '⏳', 'in_progress': '🔄', 'under_review': '🔍',
            'waiting_client': '⏸️', 'completed': '✅', 'cancelled': '❌'
        };
        return icons[status] || '📋';
    }
}
