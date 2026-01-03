import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-image-cropper-modal',
    standalone: true,
    imports: [CommonModule, ImageCropperComponent],
    template: `
    <div class="modal-backdrop" (click)="cancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Crop Image</h3>
          <button class="close-btn" (click)="cancel()">×</button>
        </div>
        
        <div class="modal-body">
          <image-cropper
            [imageChangedEvent]="imageChangedEvent"
            [maintainAspectRatio]="true"
            [aspectRatio]="aspectRatio"
            format="png"
            (imageCropped)="imageCropped($event)"
            (imageLoaded)="imageLoaded($event)"
            (cropperReady)="cropperReady()"
            (loadImageFailed)="loadImageFailed()"
          ></image-cropper>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" (click)="cancel()">Cancel</button>
          <button class="btn-confirm" (click)="confirm()">Apply Crop</button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 600px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
    .modal-header {
      padding: 16px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 { margin: 0; font-size: 1.2rem; }
      .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
    }
    .modal-body {
      padding: 16px;
      background: #f9f9f9;
      min-height: 300px;
    }
    .modal-footer {
      padding: 16px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .btn-cancel {
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-confirm {
      padding: 8px 16px;
      background: #000;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class ImageCropperModalComponent {
    @Input() imageChangedEvent: any = '';
    @Input() aspectRatio = 16 / 9; // Default 16:9 for cards
    @Output() cropConfirm = new EventEmitter<Blob>();
    @Output() cropCancel = new EventEmitter<void>();

    croppedImage: SafeUrl = '';
    croppedBlob: Blob | null = null;

    constructor(private sanitizer: DomSanitizer) { }

    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl || event.base64 || '');
        this.croppedBlob = event.blob || null;
    }

    imageLoaded(image: LoadedImage) {
        // show cropper
    }

    cropperReady() {
        // cropper ready
    }

    loadImageFailed() {
        // show message
        alert('Failed to load image');
    }

    confirm() {
        if (this.croppedBlob) {
            this.cropConfirm.emit(this.croppedBlob);
        }
    }

    cancel() {
        this.cropCancel.emit();
    }
}
