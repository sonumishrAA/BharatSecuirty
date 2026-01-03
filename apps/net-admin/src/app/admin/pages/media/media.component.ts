import { Component, OnInit, signal } from '@angular/core';
import { MediaService, MediaFile, MediaList } from '@core/services/media.service';

@Component({
    selector: 'app-media',
    standalone: true,
    imports: [],
    templateUrl: './media.component.html',
    styleUrl: './media.component.scss'
})
export class MediaComponent implements OnInit {
    media = signal<MediaList>({ covers: [], files: [] });
    loading = signal(true);

    constructor(private mediaService: MediaService) { }

    ngOnInit(): void {
        this.fetchMedia();
    }

    fetchMedia(): void {
        this.loading.set(true);
        this.mediaService.getAll().subscribe({
            next: (data) => {
                this.media.set(data);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
            }
        });
    }

    async copyUrl(url: string): Promise<void> {
        await navigator.clipboard.writeText(url);
        alert('Copied');
    }

    deleteFile(filename: string, type: 'covers' | 'files'): void {
        if (!confirm('Delete permanently?')) return;

        this.mediaService.delete(filename, type).subscribe({
            next: () => {
                this.fetchMedia();
            }
        });
    }

    getFilename(url: string): string {
        return url.split('/').pop() || '';
    }
}
