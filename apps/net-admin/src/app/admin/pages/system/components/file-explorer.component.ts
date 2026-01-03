import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemService, MediaFile } from '../../../../core/services/system.service';

@Component({
    selector: 'app-file-explorer',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="file-explorer">
      <h3>File Storage (Uploads)</h3>
      
      <div class="section">
        <h4>Cover Images ({{ covers.length }})</h4>
        <div class="file-grid">
          @for (file of covers; track file.name) {
            <div class="file-card">
              <div class="preview">
                <img [src]="file.url" [alt]="file.name" loading="lazy" (error)="onImgError($event)">
              </div>
              <div class="info">
                <span class="name" [title]="file.name">{{ file.name }}</span>
                <span class="size">{{ formatSize(file.size) }}</span>
              </div>
            </div>
          } @empty {
             <div class="empty">No cover images</div>
          }
        </div>
      </div>

      <div class="section">
        <h4>Other Files ({{ files.length }})</h4>
        <div class="file-grid">
          @for (file of files; track file.name) {
            <div class="file-card file-type">
              <div class="preview icon-preview">
                📄
              </div>
              <div class="info">
                <span class="name" [title]="file.name">{{ file.name }}</span>
                <span class="size">{{ formatSize(file.size) }}</span>
                <a [href]="file.url" target="_blank" class="download-link">Download</a>
              </div>
            </div>
          } @empty {
             <div class="empty">No other files</div>
          }
        </div>
      </div>
    </div>
  `,
    styles: [`
    .file-explorer { padding: 20px; background: #1e293b; border-radius: 8px; min-height: calc(100vh - 140px); }
    h3 { color: white; margin-bottom: 20px; }
    h4 { color: #94a3b8; margin: 20px 0 10px; font-size: 0.9rem; text-transform: uppercase; border-bottom: 1px solid #334155; padding-bottom: 5px; }

    .file-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; }
    
    .file-card { background: #0f172a; border-radius: 8px; overflow: hidden; border: 1px solid #334155; transition: transform 0.2s; }
    .file-card:hover { transform: translateY(-2px); border-color: #0ea5e9; }
    
    .preview { height: 120px; background: #000; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .preview img { width: 100%; height: 100%; object-fit: cover; }
    .icon-preview { font-size: 3rem; background: #1e293b; }
    
    .info { padding: 10px; }
    .name { display: block; font-size: 0.8rem; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
    .size { display: block; font-size: 0.7rem; color: #64748b; }
    
    .download-link { display: block; margin-top: 5px; font-size: 0.75rem; color: #0ea5e9; text-decoration: none; }
    .download-link:hover { text-decoration: underline; }
    
    .empty { color: #64748b; font-style: italic; padding: 20px; }
  `]
})
export class FileExplorerComponent implements OnInit {
    private systemService = inject(SystemService);
    covers: MediaFile[] = [];
    files: MediaFile[] = [];

    ngOnInit() {
        this.systemService.getFiles().subscribe(data => {
            this.covers = data.covers || [];
            this.files = data.files || [];
        });
    }

    formatSize(bytes?: number): string {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    onImgError(event: any) {
        event.target.src = 'assets/placeholder-tech.jpg'; // Fallback
    }
}
