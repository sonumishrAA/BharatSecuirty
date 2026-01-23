import {
    Component,
    Input,
    Output,
    EventEmitter,
    ElementRef,
    HostListener,
    signal,
    computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FloatingItem, CANVAS_INNER_WIDTH, MIN_IMAGE_WIDTH, GRID_SNAP_SIZE } from '@shared/models/editor-json.model';

type ResizeHandle = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se';

@Component({
    selector: 'app-floating-image',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div 
      class="floating-image"
      [class.selected]="selected()"
      [class.dragging]="isDragging()"
      [style.left.px]="image.x"
      [style.top.px]="image.y"
      [style.width.px]="image.width"
      [style.height.px]="image.height"
      [style.z-index]="image.zIndex"
      (pointerdown)="onPointerDown($event)"
      (dblclick)="onDoubleClick()">
      
      <img 
        [src]="image.src" 
        [alt]="image.alt || ''"
        draggable="false"
        (load)="onImageLoad()"
        (error)="onImageError()">

      @if (image.caption) {
        <div class="caption">{{ image.caption }}</div>
      }

      @if (selected()) {
        <!-- Resize handles -->
        <div class="resize-handle nw" (pointerdown)="onResizeStart($event, 'nw')"></div>
        <div class="resize-handle n" (pointerdown)="onResizeStart($event, 'n')"></div>
        <div class="resize-handle ne" (pointerdown)="onResizeStart($event, 'ne')"></div>
        <div class="resize-handle w" (pointerdown)="onResizeStart($event, 'w')"></div>
        <div class="resize-handle e" (pointerdown)="onResizeStart($event, 'e')"></div>
        <div class="resize-handle sw" (pointerdown)="onResizeStart($event, 'sw')"></div>
        <div class="resize-handle s" (pointerdown)="onResizeStart($event, 's')"></div>
        <div class="resize-handle se" (pointerdown)="onResizeStart($event, 'se')"></div>

        <!-- Size indicator -->
        <div class="size-indicator">
          {{ image.width | number:'1.0-0' }} × {{ image.height | number:'1.0-0' }}
        </div>
      }
    </div>
  `,
    styles: [`
    .floating-image {
      position: absolute;
      cursor: move;
      user-select: none;
      border: 2px solid transparent;
      border-radius: 4px;
      transition: box-shadow 0.15s ease;

      &:hover:not(.selected) {
        border-color: rgba(0, 255, 136, 0.3);
      }

      &.selected {
        border-color: #00ff88;
        box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.2);
      }

      &.dragging {
        opacity: 0.8;
        cursor: grabbing;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        pointer-events: none;
        border-radius: 2px;
      }

      .caption {
        position: absolute;
        bottom: -24px;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 12px;
        color: #94a3b8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    // Resize handles
    .resize-handle {
      position: absolute;
      width: 8px;
      height: 8px;
      background: #00ff88;
      border: 1px solid #0a0a0a;
      border-radius: 50%;
      z-index: 10;
      box-shadow: 0 0 2px rgba(0,0,0,0.5);

      &.nw { top: -4px; left: -4px; cursor: nw-resize; }
      &.n { top: -4px; left: 50%; transform: translateX(-50%); cursor: n-resize; }
      &.ne { top: -4px; right: -4px; cursor: ne-resize; }
      &.w { top: 50%; left: -4px; transform: translateY(-50%); cursor: w-resize; }
      &.e { top: 50%; right: -4px; transform: translateY(-50%); cursor: e-resize; }
      &.sw { bottom: -4px; left: -4px; cursor: sw-resize; }
      &.s { bottom: -4px; left: 50%; transform: translateX(-50%); cursor: s-resize; }
      &.se { bottom: -4px; right: -4px; cursor: se-resize; }

      &:hover {
        transform: scale(1.5);
      }
    }

    .size-indicator {
      position: absolute;
      bottom: -28px;
      right: 0;
      background: rgba(0, 0, 0, 0.8);
      color: #00ff88;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-family: monospace;
      white-space: nowrap;
    }
  `]
})
export class FloatingImageComponent {
    @Input({ required: true }) image!: FloatingItem;
    @Input() canvasWidth = CANVAS_INNER_WIDTH;

    @Output() select = new EventEmitter<string>();
    @Output() positionChange = new EventEmitter<{ id: string; x: number; y: number }>();
    @Output() sizeChange = new EventEmitter<{ id: string; width: number; height: number }>();
    @Output() deleteRequest = new EventEmitter<string>();

    selected = signal(false);
    isDragging = signal(false);
    isResizing = signal(false);

    private dragOffset = { x: 0, y: 0 };
    private resizeHandle: ResizeHandle | null = null;
    private initialSize = { width: 0, height: 0 };
    private initialPosition = { x: 0, y: 0 };
    private startMousePos = { x: 0, y: 0 }; // Track where resize started
    private aspectRatio = 1;

    constructor(private elementRef: ElementRef) { }

    // ===== Selection =====
    onPointerDown(event: PointerEvent) {
        if (this.isResizing()) return;

        event.preventDefault();
        event.stopPropagation();

        // Select this image
        this.selected.set(true);
        this.select.emit(this.image.id);

        // Start drag
        this.isDragging.set(true);
        this.dragOffset = {
            x: event.clientX - this.image.x,
            y: event.clientY - this.image.y
        };

        (event.target as HTMLElement).setPointerCapture(event.pointerId);
    }

    onDoubleClick() {
        this.selected.set(true);
        this.select.emit(this.image.id);
    }

    // ===== Drag handling =====
    @HostListener('pointermove', ['$event'])
    onPointerMove(event: PointerEvent) {
        if (this.isDragging()) {
            event.preventDefault();
            const newX = event.clientX - this.dragOffset.x;
            const newY = event.clientY - this.dragOffset.y;

            // Debug drag calculation
            console.log('Drag:', {
                clientX: event.clientX,
                dragOffsetX: this.dragOffset.x,
                newX,
                width: this.image.width,
                canvasWidth: this.canvasWidth,
                maxX: this.canvasWidth - this.image.width
            });

            // Clamp to canvas boundaries
            const clampedX = Math.max(0, Math.min(newX, this.canvasWidth - this.image.width));
            const clampedY = Math.max(0, newY);

            // Optional: snap to grid
            const snappedX = event.shiftKey ? clampedX : Math.round(clampedX / GRID_SNAP_SIZE) * GRID_SNAP_SIZE;
            const snappedY = event.shiftKey ? clampedY : Math.round(clampedY / GRID_SNAP_SIZE) * GRID_SNAP_SIZE;

            this.positionChange.emit({ id: this.image.id, x: snappedX, y: snappedY });
        }

        if (this.isResizing() && this.resizeHandle) {
            event.preventDefault();
            this.handleResize(event);
        }
    }

    @HostListener('pointerup', ['$event'])
    @HostListener('pointercancel', ['$event'])
    onPointerUp(event: PointerEvent) {
        if (this.isDragging()) {
            this.isDragging.set(false);
            (event.target as HTMLElement).releasePointerCapture(event.pointerId);
        }

        if (this.isResizing()) {
            this.isResizing.set(false);
            this.resizeHandle = null;
        }
    }

    // ===== Resize handling =====
    onResizeStart(event: PointerEvent, handle: ResizeHandle) {
        event.preventDefault();
        event.stopPropagation();

        this.isResizing.set(true);
        this.resizeHandle = handle;
        this.initialSize = { width: this.image.width, height: this.image.height };
        this.initialPosition = { x: this.image.x, y: this.image.y };
        this.startMousePos = { x: event.clientX, y: event.clientY }; // Store start position
        this.aspectRatio = this.image.width / this.image.height;

        (event.target as HTMLElement).setPointerCapture(event.pointerId);
    }

    private handleResize(event: PointerEvent) {
        if (!this.resizeHandle) return;

        const handle = this.resizeHandle;

        // Calculate delta from START mouse position (prevents jump on click)
        const deltaX = event.clientX - this.startMousePos.x;
        const deltaY = event.clientY - this.startMousePos.y;

        let newWidth = this.initialSize.width;
        let newHeight = this.initialSize.height;
        let newX = this.initialPosition.x;
        let newY = this.initialPosition.y;

        // Calculate new dimensions based on handle using DELTA
        if (handle.includes('e')) {
            newWidth = Math.max(MIN_IMAGE_WIDTH, this.initialSize.width + deltaX);
        }
        if (handle.includes('w')) {
            newWidth = Math.max(MIN_IMAGE_WIDTH, this.initialSize.width - deltaX);
            if (newWidth > MIN_IMAGE_WIDTH) {
                newX = this.initialPosition.x + deltaX;
            }
        }
        if (handle.includes('s')) {
            newHeight = Math.max(MIN_IMAGE_WIDTH / this.aspectRatio, this.initialSize.height + deltaY);
        }
        if (handle.includes('n')) {
            newHeight = Math.max(MIN_IMAGE_WIDTH / this.aspectRatio, this.initialSize.height - deltaY);
            if (newHeight > MIN_IMAGE_WIDTH / this.aspectRatio) {
                newY = this.initialPosition.y + deltaY;
            }
        }

        // Lock aspect ratio by DEFAULT (Shift key unlocks for free resize)
        if (!event.shiftKey) {
            if (handle.includes('e') || handle.includes('w')) {
                newHeight = newWidth / this.aspectRatio;
            } else {
                newWidth = newHeight * this.aspectRatio;
            }
        }

        // Clamp width to canvas
        newWidth = Math.min(newWidth, this.canvasWidth);

        // Emit changes
        this.sizeChange.emit({ id: this.image.id, width: newWidth, height: newHeight });
        if (newX !== this.image.x || newY !== this.image.y) {
            this.positionChange.emit({ id: this.image.id, x: Math.max(0, newX), y: Math.max(0, newY) });
        }
    }

    // ===== Keyboard handling =====
    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        if (!this.selected()) return;

        const nudgeAmount = event.shiftKey ? 10 : 1;

        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.positionChange.emit({
                    id: this.image.id,
                    x: Math.max(0, this.image.x - nudgeAmount),
                    y: this.image.y
                });
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.positionChange.emit({
                    id: this.image.id,
                    x: Math.min(this.canvasWidth - this.image.width, this.image.x + nudgeAmount),
                    y: this.image.y
                });
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.positionChange.emit({
                    id: this.image.id,
                    x: this.image.x,
                    y: Math.max(0, this.image.y - nudgeAmount)
                });
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.positionChange.emit({
                    id: this.image.id,
                    x: this.image.x,
                    y: this.image.y + nudgeAmount
                });
                break;
            case 'Delete':
            case 'Backspace':
                event.preventDefault();
                this.deleteRequest.emit(this.image.id);
                break;
        }
    }

    deselect() {
        this.selected.set(false);
    }

    onImageLoad() {
        // Image loaded successfully
    }

    onImageError() {
        console.error('Failed to load image:', this.image.src);
    }
}
