import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments';

export interface Booking {
    id: string;
    service_id: string;
    service_title?: string;
    contact_name: string;
    contact_email: string;
    message: string;
    attachment_url?: string;
    created_at: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    company?: string;
    phone?: string;
    service_type?: string;
    temp_password?: string;
    additional_info?: string;
    progress?: number;
    admin_notes?: string;
}

export interface BusinessService {
    id?: string;
    title: string;
    slug?: string;
    description: string;
    icon: string;
    features?: string[];
    status?: 'active' | 'inactive';
}

export interface BusinessTestimonial {
    id?: string;
    client_name: string;
    company?: string;
    content: string;
    rating: number;
    avatar_url?: string;
    created_at?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private apiUrl = `${environment.apiUrl}/business`;

    constructor(private http: HttpClient) { }

    // Bookings
    getBookings(): Observable<Booking[]> {
        return this.http.get<Booking[]>(`${this.apiUrl}/bookings`);
    }

    // Services
    getAllServices(): Observable<BusinessService[]> {
        return this.http.get<BusinessService[]>(`${this.apiUrl}/services`);
    }

    createService(service: BusinessService): Observable<BusinessService> {
        return this.http.post<BusinessService>(`${this.apiUrl}/services`, service);
    }

    updateService(id: string, service: BusinessService): Observable<BusinessService> {
        return this.http.put<BusinessService>(`${this.apiUrl}/services/${id}`, service);
    }

    // Delete Bookings
    deleteBooking(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/bookings/${id}`);
    }

    bulkDeleteBookings(ids: string[]): Observable<any> {
        return this.http.post(`${this.apiUrl}/bookings/bulk-delete`, { ids });
    }

    // Users Management
    getUsers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/users`);
    }

    getUserDetails(userId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/users/${userId}`);
    }

    updateUserCredentials(userId: string, data: { email?: string, password?: string }): Observable<any> {
        return this.http.put(`${this.apiUrl}/users/${userId}/credentials`, data);
    }

    deleteUser(userId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/users/${userId}`);
    }

    // Status Management
    updateBookingStatus(bookingId: string, data: { status: string; progress?: number; notes?: string }): Observable<any> {
        return this.http.put(`${this.apiUrl}/bookings/${bookingId}/status`, data);
    }

    getStatusHistory(bookingId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/bookings/${bookingId}/history`);
    }

    // Chat Messages
    getMessages(bookingId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/bookings/${bookingId}/messages`);
    }

    sendMessage(bookingId: string, content: string, file?: File): Observable<any> {
        console.log('AdminService.sendMessage:', { bookingId, content, file });
        const formData = new FormData();
        formData.append('content', content || ''); // Ensure content is string
        if (file) {
            console.log('Appending file to FormData:', file.name);
            formData.append('attachment', file);
        }
        return this.http.post(`${this.apiUrl}/bookings/${bookingId}/messages`, formData);
    }

    // Dashboard Stats
    getDashboardStats(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/stats`);
    }

    // Testimonials
    getTestimonials(): Observable<BusinessTestimonial[]> {
        return this.http.get<BusinessTestimonial[]>(`${this.apiUrl}/testimonials`);
    }

    createTestimonial(data: BusinessTestimonial): Observable<BusinessTestimonial> {
        console.log('AdminService.createTestimonial:', data);
        return this.http.post<BusinessTestimonial>(`${this.apiUrl}/testimonials`, data);
    }

    updateTestimonial(id: string, data: BusinessTestimonial): Observable<BusinessTestimonial> {
        return this.http.put<BusinessTestimonial>(`${this.apiUrl}/testimonials/${id}`, data);
    }

    deleteTestimonial(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/testimonials/${id}`);
    }
}

