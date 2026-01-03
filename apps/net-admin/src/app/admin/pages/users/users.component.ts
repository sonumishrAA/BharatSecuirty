import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';

interface ClientUser {
    id: string;
    email: string;
    name?: string;
    company?: string;
    phone?: string;
    booking_count: number;
    created_at: string;
}

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
    users: ClientUser[] = [];
    filteredUsers: ClientUser[] = [];
    isLoading = true;
    searchQuery = '';

    constructor(private adminService: AdminService, private router: Router) { }

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.isLoading = true;
        this.adminService.getUsers().subscribe({
            next: (data) => {
                this.users = data;
                this.filteredUsers = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to load users', err);
                this.isLoading = false;
            }
        });
    }

    filterUsers() {
        const q = this.searchQuery.toLowerCase();
        this.filteredUsers = this.users.filter(u =>
            u.email.toLowerCase().includes(q) ||
            u.name?.toLowerCase().includes(q) ||
            u.company?.toLowerCase().includes(q)
        );
    }

    viewUser(userId: string) {
        this.router.navigate(['/admin/users', userId]);
    }

    editUser(userId: string) {
        this.router.navigate(['/admin/users', userId], { queryParams: { edit: 'true' } });
    }

    deleteUser(userId: string) {
        if (!confirm('DANGER: Are you sure you want to DELETE THIS USER? \n\nThis will permanently delete:\n- The user account\n- ALL their bookings\n- ALL chat history\n\nThis action cannot be undone.')) return;

        this.adminService.deleteUser(userId).subscribe({
            next: () => {
                alert('User deleted successfully');
                this.loadUsers();
            },
            error: (err) => {
                console.error('Failed to delete user', err);
                alert('Failed to delete user');
            }
        });
    }

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}
