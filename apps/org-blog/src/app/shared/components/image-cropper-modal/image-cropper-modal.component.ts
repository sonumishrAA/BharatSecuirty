import { Component, EventEmitter, Input, Output, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage, ImageTransform } from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

export interface ImageUploadResult {
  blob: Blob;
  alignment: 'left' | 'center' | 'right';
  width: number;  // Cropped image width
  height: number; // Cropped image height
}

@Component({
  selector: 'app-image-cropper-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageCropperComponent],
  template: `
    <div class="modal-backdrop" (click)="cancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>
            <span class="material-icons-round">crop</span>
            Edit Image
          </h3>
          <button class="close-btn" (click)="cancel()">
            <span class="material-icons-round">close</span>
          </button>
        </div>
        
        <div class="modal-body">
          <!-- Cropper Area -->
          <div class="cropper-area">
            <image-cropper
              [imageChangedEvent]="imageChangedEvent"
              [maintainAspectRatio]="maintainAspectRatio"
              [aspectRatio]="aspectRatio"
              [transform]="transform"
              [canvasRotation]="canvasRotation"
              [containWithinAspectRatio]="false"
              [resizeToWidth]="600"
              [onlyScaleDown]="true"
              format="png"
              (imageCropped)="imageCropped($event)"
              (imageLoaded)="imageLoaded($event)"
              (cropperReady)="cropperReady()"
              (loadImageFailed)="loadImageFailed()"
            ></image-cropper>
          </div>

          <!-- Controls -->
          <div class="controls-section">
            <!-- Rotation Controls -->
            <div class="control-group">
              <span class="control-label">Rotate</span>
              <div class="rotation-controls">
                <button class="control-btn" (click)="rotateLeft()" title="Rotate Left">
                  <span class="material-icons-round">rotate_left</span>
                </button>
                <span class="rotation-value">{{ canvasRotation * 90 }}°</span>
                <button class="control-btn" (click)="rotateRight()" title="Rotate Right">
                  <span class="material-icons-round">rotate_right</span>
                </button>
              </div>
            </div>

            <!-- Flip Controls -->
            <div class="control-group">
              <span class="control-label">Flip</span>
              <div class="flip-controls">
                <button class="control-btn" [class.active]="transform.flipH" (click)="flipHorizontal()" title="Flip Horizontal">
                  <span class="material-icons-round">flip</span>
                </button>
                <button class="control-btn" [class.active]="transform.flipV" (click)="flipVertical()" title="Flip Vertical">
                  <span class="material-icons-round rotate-90">flip</span>
                </button>
              </div>
            </div>

            <!-- Aspect Ratio Toggle -->
            @if (showAspectToggle) {
            <div class="control-group">
              <span class="control-label">Ratio</span>
              <div class="aspect-controls">
                <button class="control-btn" [class.active]="!maintainAspectRatio" (click)="maintainAspectRatio = false" title="Free">
                  <span class="material-icons-round">crop_free</span>
                </button>
                <button class="control-btn" [class.active]="maintainAspectRatio && aspectRatio === 16/9" (click)="setAspect(16/9)" title="16:9">
                  16:9
                </button>
                <button class="control-btn" [class.active]="maintainAspectRatio && aspectRatio === 4/3" (click)="setAspect(4/3)" title="4:3">
                  4:3
                </button>
                <button class="control-btn" [class.active]="maintainAspectRatio && aspectRatio === 1" (click)="setAspect(1)" title="Square">
                  1:1
                </button>
              </div>
            </div>
            }

            <!-- Alignment Controls (for editor images) -->
            @if (showAlignmentOptions) {
            <div class="control-group">
              <span class="control-label">Alignment</span>
              <div class="alignment-controls">
                <button class="control-btn" [class.active]="alignment === 'left'" (click)="alignment = 'left'" title="Align Left">
                  <span class="material-icons-round">format_align_left</span>
                </button>
                <button class="control-btn" [class.active]="alignment === 'center'" (click)="alignment = 'center'" title="Align Center">
                  <span class="material-icons-round">format_align_center</span>
                </button>
                <button class="control-btn" [class.active]="alignment === 'right'" (click)="alignment = 'right'" title="Align Right">
                  <span class="material-icons-round">format_align_right</span>
                </button>
              </div>
            </div>
            }

            <!-- Reset Button -->
            <button class="reset-btn" (click)="resetTransform()">
              <span class="material-icons-round">restart_alt</span>
              Reset
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" (click)="cancel()">
            <span class="material-icons-round">close</span>
            Cancel
          </button>
          <button class="btn-confirm" (click)="confirm()" [disabled]="!croppedBlob">
            <span class="material-icons-round">check</span>
            Apply
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(4px);
    }

    .modal-content {
      background: #0a0a1a;
      border-radius: 16px;
      width: 95%;
      max-width: 700px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 242, 254, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .modal-header {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(0, 242, 254, 0.05);
      
      h3 { 
        margin: 0; 
        font-size: 1.1rem; 
        color: white;
        display: flex;
        align-items: center;
        gap: 8px;

        .material-icons-round {
          color: #00f2fe;
          font-size: 20px;
        }
      }
      
      .close-btn { 
        background: none; 
        border: none; 
        color: #94a3b8;
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
        transition: all 0.2s;

        &:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .material-icons-round {
          font-size: 22px;
        }
      }
    }

    .modal-body {
      padding: 20px;
      background: #0f1225;
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .cropper-area {
      background: rgba(0, 0, 0, 0.4);
      border-radius: 12px;
      padding: 16px;
      min-height: 300px;
      max-height: 450px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;

      image-cropper {
        max-width: 100%;
        max-height: 100%;
      }
    }

    .controls-section {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      padding: 16px;
      background: rgba(0, 242, 254, 0.03);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .control-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      font-weight: 600;
    }

    .rotation-controls,
    .flip-controls,
    .aspect-controls,
    .alignment-controls {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .rotation-value {
      min-width: 40px;
      text-align: center;
      color: #00f2fe;
      font-size: 12px;
      font-weight: 600;
    }

    .control-btn {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 11px;
      font-weight: 600;

      .material-icons-round {
        font-size: 18px;
      }

      &:hover {
        background: rgba(0, 242, 254, 0.1);
        border-color: rgba(0, 242, 254, 0.3);
        color: #00f2fe;
      }

      &.active {
        background: rgba(0, 242, 254, 0.2);
        border-color: #00f2fe;
        color: #00f2fe;
      }
    }

    .rotate-90 {
      transform: rotate(90deg);
    }

    .reset-btn {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #94a3b8;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      .material-icons-round {
        font-size: 16px;
      }

      &:hover {
        background: rgba(239, 68, 68, 0.1);
        border-color: rgba(239, 68, 68, 0.3);
        color: #ef4444;
      }
    }

    .modal-footer {
      padding: 16px 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      background: rgba(0, 0, 0, 0.3);
    }

    .btn-cancel, .btn-confirm {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;

      .material-icons-round {
        font-size: 18px;
      }
    }

    .btn-cancel {
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.05);
      color: #94a3b8;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }
    }

    .btn-confirm {
      background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
      color: #050510;
      border: none;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0, 242, 254, 0.4);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    @media (max-width: 600px) {
      .modal-content {
        width: 100%;
        max-width: 100%;
        height: 100%;
        max-height: 100%;
        border-radius: 0;
      }

      .controls-section {
        flex-direction: column;
      }

      .reset-btn {
        margin-left: 0;
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ImageCropperModalComponent implements OnChanges {
  @Input() imageChangedEvent: any = '';
  @Input() aspectRatio = 16 / 9;
  @Input() showAlignmentOptions = false; // For editor images
  @Input() showAspectToggle = true;

  @Output() cropConfirm = new EventEmitter<Blob>();
  @Output() cropConfirmWithOptions = new EventEmitter<ImageUploadResult>();
  @Output() cropCancel = new EventEmitter<void>();

  croppedImage: SafeUrl = '';
  croppedBlob: Blob | null = null;
  croppedWidth = 320;  // Default width
  croppedHeight = 180; // Default height

  // Transform controls
  canvasRotation = 0;
  transform: ImageTransform = {};
  maintainAspectRatio = true;

  // Alignment
  alignment: 'left' | 'center' | 'right' = 'center';

  constructor(private sanitizer: DomSanitizer) { }

  // Reset state when new image is loaded
  ngOnChanges(changes: any) {
    if (changes.imageChangedEvent && changes.imageChangedEvent.currentValue) {
      // Reset confirm guard when new image is loaded
      this.confirmClicked = false;
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl || event.base64 || '');
    this.croppedBlob = event.blob || null;
    // Store cropped dimensions for proper sizing
    this.croppedWidth = event.width || 320;
    this.croppedHeight = event.height || 180;
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

  // Rotation
  rotateLeft() {
    this.canvasRotation = (this.canvasRotation - 1 + 4) % 4;
  }

  rotateRight() {
    this.canvasRotation = (this.canvasRotation + 1) % 4;
  }

  // Flip
  flipHorizontal() {
    this.transform = {
      ...this.transform,
      flipH: !this.transform.flipH
    };
  }

  flipVertical() {
    this.transform = {
      ...this.transform,
      flipV: !this.transform.flipV
    };
  }

  // Aspect Ratio
  setAspect(ratio: number) {
    this.maintainAspectRatio = true;
    this.aspectRatio = ratio;
    // Force transform update to trigger cropper recalculation
    this.transform = { ...this.transform };
  }

  // Reset
  resetTransform() {
    this.canvasRotation = 0;
    this.transform = {};
    this.alignment = 'center';
  }

  // Guard to prevent double-confirm
  private confirmClicked = false;

  confirm() {
    // GUARD: Prevent double-click on confirm
    if (this.confirmClicked) {
      console.warn('Confirm already clicked, ignoring');
      return;
    }

    if (this.croppedBlob) {
      this.confirmClicked = true; // Lock immediately

      if (this.showAlignmentOptions) {
        this.cropConfirmWithOptions.emit({
          blob: this.croppedBlob,
          alignment: this.alignment,
          width: this.croppedWidth,
          height: this.croppedHeight
        });
      } else {
        this.cropConfirm.emit(this.croppedBlob);
      }
    }
  }

  cancel() {
    this.cropCancel.emit();
  }
}
