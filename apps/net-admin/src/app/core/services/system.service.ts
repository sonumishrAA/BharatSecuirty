import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments';
import { Observable } from 'rxjs';

export interface RouteInfo {
    path: string;
    method: string;
}

export interface MediaFile {
    name: string;
    url: string;
    type: 'image' | 'file';
    size?: number;
}

@Injectable({
    providedIn: 'root'
})
export class SystemService {
    private apiUrl = `${environment.apiUrl}/admin/system`;

    constructor(private http: HttpClient) { }

    getRoutes(): Observable<RouteInfo[]> {
        return this.http.get<RouteInfo[]>(`${this.apiUrl}/routes`);
    }

    getTables(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/tables`);
    }

    getTableData(tableName: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/tables/${tableName}`);
    }

    getFiles(): Observable<{ covers: MediaFile[], files: MediaFile[] }> {
        return this.http.get<{ covers: MediaFile[], files: MediaFile[] }>(`${this.apiUrl}/files`);
    }
}
