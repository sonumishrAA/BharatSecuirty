import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage, ImageTransform } from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-image-cropper-modal',
  standalone: true,
  imports: [CommonModule, ImageCropperComponent],
  templateUrl: './image-cropper-modal.component.html',
  styleUrl: './image-cropper-modal.component.scss'
})
export class ImageCropperModalComponent {
  @Input() imageChangedEvent: any = '';
  @Input() aspectRatio = 16 / 9;
  @Output() cropConfirm = new EventEmitter<Blob>();
  @Output() cropCancel = new EventEmitter<void>();

  croppedImage: SafeUrl = '';
  croppedBlob: Blob | null = null;

  // Transform State
  transform: ImageTransform = {
    scale: 1,
    rotate: 0,
    flipH: false,
    flipV: false
  };

  maintainAspectRatio = true;

  constructor(private sanitizer: DomSanitizer) { }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl || event.base64 || '');
    this.croppedBlob = event.blob || null;
  }

  imageLoaded(image: LoadedImage) {
    // Image loaded successfully
  }

  cropperReady() {
    // Cropper ready
  }

  loadImageFailed() {
    alert('Failed to load image');
  }

  // Controls
  onZoomChange(event: any) {
    this.transform = {
      ...this.transform,
      scale: parseFloat(event.target.value)
    };
  }

  onRotateChange(event: any) {
    this.transform = {
      ...this.transform,
      rotate: parseFloat(event.target.value)
    };
  }

  setAspectRatio(ratio: number) {
    this.aspectRatio = ratio;
    this.maintainAspectRatio = true;
  }

  toggleFreeStyle() {
    this.maintainAspectRatio = false;
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
