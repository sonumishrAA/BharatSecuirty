import { Component, OnInit, signal } from '@angular/core';
import { MediaService, MediaFile, MediaList } from '@core/services/media.service';
import { ConfirmDialogService } from '@core/services/confirm-dialog.service';
import { ToastService } from '@core/services/toast.service';

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

    constructor(
        private mediaService: MediaService,
        private confirm: ConfirmDialogService,
        private toast: ToastService
    ) { }

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
        this.toast.success('URL Copied');
    }

    async deleteFile(filename: string, type: 'covers' | 'files'): Promise<void> {
        const confirmed = await this.confirm.confirm({
            title: 'Delete File',
            message: 'Are you sure you want to permanently delete this file? This action cannot be undone.',
            confirmText: 'Delete',
            type: 'danger'
        });

        if (confirmed) {
            this.mediaService.delete(filename, type).subscribe({
                next: () => {
                    this.toast.success('File deleted');
                    this.fetchMedia();
                },
                error: () => this.toast.error('Failed to delete file')
            });
        }
    }

    getFilename(url: string): string {
        return url.split('/').pop() || '';
    }
}
