import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Booking {
    id: string;
    service_title?: string;
    service_type?: string;
    contact_name: string;
    contact_email: string;
    message?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    progress?: number;
    admin_notes?: string;
    created_at: string;
    updated_at: string;
}

@Injectable({
    providedIn: 'root'
})
export class ClientService {
    private apiUrl = `${environment.apiUrl}`;

    constructor(private http: HttpClient) { }

    getMyBookings(): Observable<Booking[]> {
        return this.http.get<Booking[]>(`${this.apiUrl}/client/bookings`);
    }

    getBookingDetails(id: string): Observable<Booking> {
        return this.http.get<Booking>(`${this.apiUrl}/client/bookings/${id}`);
    }

    // Messages
    getMessages(bookingId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/business/bookings/${bookingId}/messages`);
    }

    sendMessage(bookingId: string, content: string, file?: File): Observable<any> {
        const formData = new FormData();
        formData.append('content', content);
        if (file) {
            formData.append('attachment', file);
        }
        return this.http.post(`${this.apiUrl}/business/bookings/${bookingId}/messages`, formData);
    }

    // Status History
    getStatusHistory(bookingId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/business/bookings/${bookingId}/history`);
    }
}

