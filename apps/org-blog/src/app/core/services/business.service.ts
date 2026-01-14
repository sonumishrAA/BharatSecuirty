import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments';

export interface Service {
    id: string;
    title: string;
    slug: string;
    description: string;
    icon: string;
    short_description?: string;
}

@Injectable({
    providedIn: 'root'
})
export class BusinessService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/business`;

    /**
     * Get all services
     */
    getServices(): Observable<Service[]> {
        return this.http.get<Service[]>(`${this.apiUrl}/services`);
    }

    /**
     * Get service by slug
     */
    getServiceBySlug(slug: string): Observable<Service> {
        return this.http.get<Service>(`${this.apiUrl}/services/${slug}`);
    }
}
