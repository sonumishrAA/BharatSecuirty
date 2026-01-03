import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MediaFile {
    name: string;
    filename?: string;
    url: string;
    type: 'image' | 'file';
    size?: number;
    mimetype?: string;
}

export interface MediaList {
    covers: MediaFile[];
    files: MediaFile[];
}

@Injectable({
    providedIn: 'root'
})
export class MediaService {
    private readonly API_URL = `${environment.apiUrl}/media`;

    constructor(private http: HttpClient) { }

    /**
     * Get all media files
     */
    getAll(): Observable<MediaList> {
        return this.http.get<MediaList>(this.API_URL);
    }

    /**
     * Get cover images only
     */
    getCovers(): Observable<MediaFile[]> {
        return this.http.get<MediaFile[]>(`${this.API_URL}/covers`);
    }

    /**
     * Get files only
     */
    getFiles(): Observable<MediaFile[]> {
        return this.http.get<MediaFile[]>(`${this.API_URL}/files`);
    }

    /**
     * Upload file
     */
    upload(file: File): Observable<MediaFile> {
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post<MediaFile>(`${this.API_URL}/upload`, formData);
    }

    /**
     * Delete file
     */
    delete(filename: string, type: 'covers' | 'files'): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${type}/${filename}`);
    }
}
