import { Component, OnInit, OnDestroy, signal, ViewChild, ElementRef, HostListener, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe, DecimalPipe } from '@angular/common';
import { PostsService } from '@core/services/posts.service';
import { MediaService, MediaFile } from '@core/services/media.service';
import { ToastService } from '@core/services/toast.service';
import { PostDto, PostCategory, PostStatus } from '@shared/models/post.model';
import {
    EditorJSON,
    FloatingItem,
    createEmptyEditorJSON,
    createFloatingImage,
    CANVAS_WIDTH,
    CANVAS_PADDING,
    CANVAS_INNER_WIDTH
} from '@shared/models/editor-json.model';
import { Editor, Toolbar, NgxEditorModule } from 'ngx-editor';
import { schema } from 'ngx-editor/schema';
import { ImageCropperModalComponent, ImageUploadResult } from '../../../shared/components/image-cropper-modal/image-cropper-modal.component';
import { FloatingImageComponent } from '../../components/floating-image/floating-image.component';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
    selector: 'app-editor',
    standalone: true,
    imports: [FormsModule, TitleCasePipe, NgxEditorModule, ImageCropperModalComponent, FloatingImageComponent],
    templateUrl: './editor.component.html',
    styleUrl: './editor.component.scss'
})
export class EditorComponent implements OnInit, OnDestroy {
    // State
    id = signal<string | null>(null);
    isEdit = signal(false);
    dirty = signal(false);
    saving = signal(false);
    autoSaving = signal(false);
    lastSavedAt = signal<string | null>(null);

    // UI State
    sidebarVisible = signal(false);
    showUnsavedModal = signal(false);

    // Cropper State (for cover images)
    showCropper = false;
    imageEvent: any = '';

    // Editor Image Cropper State (for canvas images)
    showEditorImageCropper = false;
    editorImageEvent: any = '';

    // Editor - initialize with proper schema
    editor!: Editor;
    toolbar: Toolbar = [
        ['undo', 'redo'],
        ['bold', 'italic', 'underline', 'strike'],
        ['code', 'blockquote'],
        ['ordered_list', 'bullet_list'],
        [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
        ['link'],
        ['align_left', 'align_center', 'align_right', 'align_justify'],
        ['text_color', 'background_color'],
        ['horizontal_rule'],
        ['format_clear'],
    ];

    // Form fields
    title = '';
    shortDesc = '';
    slug = '';
    slugManuallyEdited = false;
    metaTitle = '';
    metaDesc = '';
    category: PostCategory = 'blog';
    status: PostStatus = 'draft';
    cover = '';
    content: any = { type: 'doc', content: [] };

    // ===== CANVAS EDITOR STATE =====
    editorJson = signal<EditorJSON>(createEmptyEditorJSON());
    floatingImages = computed(() => this.editorJson().floating);
    selectedImageId = signal<string | null>(null);

    // Canvas constants
    readonly CANVAS_WIDTH = CANVAS_WIDTH;
    readonly CANVAS_PADDING = CANVAS_PADDING;
    readonly CANVAS_INNER_WIDTH = CANVAS_INNER_WIDTH;

    // Autosave
    private autosave$ = new Subject<void>();
    private destroy$ = new Subject<void>();

    categories: PostCategory[] = ['blog', 'scam_alert', 'osint_guide', 'resource'];

    // File upload section
    uploadedFiles: MediaFile[] = [];
    uploadingFile = false;
    copiedUrl = '';

    colorPresets: string[] = [
        '#000000', '#1a1a1a', '#333333', '#4d4d4d', '#666666', '#808080', '#999999', '#b3b3b3', '#cccccc', '#e6e6e6', '#f2f2f2', '#ffffff',
        '#330000', '#660000', '#990000', '#cc0000', '#ff0000', '#ff3333', '#ff6666', '#ff9999', '#ffcccc', '#ffe6e6',
        '#331a00', '#663300', '#994d00', '#cc6600', '#ff8000', '#ff9933', '#ffb366', '#ffcc99', '#ffe6cc',
        '#333300', '#666600', '#999900', '#cccc00', '#ffff00', '#ffff33', '#ffff66', '#ffff99', '#ffffcc',
        '#003300', '#006600', '#009900', '#00cc00', '#00ff00', '#33ff33', '#66ff66', '#99ff99', '#ccffcc',
        '#003333', '#006666', '#009999', '#00cccc', '#00ffff', '#33ffff', '#66ffff', '#99ffff', '#ccffff',
        '#000033', '#000066', '#000099', '#0000cc', '#0000ff', '#3333ff', '#6666ff', '#9999ff', '#ccccff',
        '#330033', '#660066', '#990099', '#cc00cc', '#ff00ff', '#ff33ff', '#ff66ff', '#ff99ff', '#ffccff',
        '#052e16', '#14532d', '#166534', '#15803d', '#16a34a', '#22c55e', '#4ade80', '#86efac',
        '#9a3412', '#c2410c', '#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa',
    ];

    @ViewChild('editorImageInput') editorImageInput!: ElementRef<HTMLInputElement>;
    @ViewChild('coverInput') coverInput!: ElementRef<HTMLInputElement>;
    @ViewChild('embedFileInput') embedFileInput!: ElementRef<HTMLInputElement>;
    @ViewChild('canvasContainer') canvasContainer!: ElementRef<HTMLDivElement>;

    constructor(
        private route: ActivatedRoute,
        public router: Router,
        private postsService: PostsService,
        private mediaService: MediaService,
        private toast: ToastService
    ) { }

    @HostListener('window:beforeunload', ['$event'])
    onBeforeUnload(event: BeforeUnloadEvent): void {
        if (this.dirty()) {
            event.preventDefault();
            event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        }
    }

    // Click on canvas background deselects image
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest('.floating-image') && !target.closest('.floating-toolbar')) {
            this.selectedImageId.set(null);
        }
    }

    // PREVENT image drops on text editor (forces use of Floating Layer)
    @HostListener('drop', ['$event'])
    onDrop(event: DragEvent) {
        const target = event.target as HTMLElement;
        // Only block drops on the ngx-editor area
        if (target.closest('.ngx-editor-canvas') || target.closest('.NgxEditor')) {
            const files = event.dataTransfer?.files;
            if (files && files.length > 0) {
                const hasImage = Array.from(files).some(f => f.type.startsWith('image/'));
                if (hasImage) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.toast.info('Use the "Add Image" button in the toolbar to add images to the canvas.');
                }
            }
        }
    }

    // PREVENT image pastes on text editor
    @HostListener('paste', ['$event'])
    onPaste(event: ClipboardEvent) {
        const target = event.target as HTMLElement;
        // Only block pastes on the ngx-editor area
        if (target.closest('.ngx-editor-canvas') || target.closest('.NgxEditor')) {
            const items = event.clipboardData?.items;
            if (items) {
                const hasImage = Array.from(items).some(item => item.type.startsWith('image/'));
                if (hasImage) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.toast.info('Use the "Add Image" button in the toolbar to add images to the canvas.');
                }
            }
        }
    }

    ngOnInit(): void {
        this.editor = new Editor({ schema });
        this.loadMediaFiles();

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.id.set(id);
            this.isEdit.set(true);
            this.loadPost(id);
        }

        this.showLoginWarning();

        // Setup autosave with debounce
        this.autosave$
            .pipe(
                debounceTime(1500),
                takeUntil(this.destroy$)
            )
            .subscribe(() => this.performAutosave());
    }

    showLoginWarning(): void {
        const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navEntries.length > 0 && navEntries[0].type === 'reload') {
            this.toast.warning('⚠️ Page refreshed! Please check your login status.');
        }
    }

    loadMediaFiles(): void {
        this.mediaService.getAll().subscribe({
            next: (mediaList) => {
                const allFiles = [
                    ...mediaList.files.map(f => ({ ...f, type: 'file' as const })),
                    ...mediaList.covers.map(f => ({ ...f, type: 'image' as const }))
                ];
                this.uploadedFiles = allFiles.slice(0, 20);
            },
            error: (err) => console.error('Failed to load media files:', err)
        });
    }

    ngOnDestroy(): void {
        this.editor.destroy();
        this.destroy$.next();
        this.destroy$.complete();
        localStorage.removeItem('admin_preview_data');
    }

    // ===== LOAD POST =====
    loadPost(id: string): void {
        this.postsService.getById(id).subscribe({
            next: (post) => {
                this.title = post.title;
                this.slug = post.slug;
                this.slugManuallyEdited = true;
                this.shortDesc = post.excerpt;
                this.metaTitle = post.meta_title || '';
                this.metaDesc = post.meta_description || '';
                this.category = post.category;
                this.status = post.status;
                this.cover = post.cover_image_url || '';

                // Load editor_json if available, otherwise migrate from content
                // Load editor_json if available, otherwise migrate from content
                // Detect meaningful legacy content
                let dbLegacyContent = post.content;
                if (typeof dbLegacyContent === 'string') {
                    try { dbLegacyContent = JSON.parse(dbLegacyContent); } catch (e) { console.error('Legacy parse error', e); }
                }
                const hasLegacyData = (dbLegacyContent?.content?.length || 0) > 0;

                // Detect meaningful editor_json content
                // Check if flow content (array) has items
                const hasEditorJsonData = (post.editor_json?.flow?.content?.length || 0) > 0;

                // Decision: Use editor_json if it exists AND (it has data OR legacy is empty)
                // If only legacy has data (migration failed case), prefer legacy.
                const preferEditorJson = !!post.editor_json && (hasEditorJsonData || !hasLegacyData);

                if (preferEditorJson && post.editor_json) {
                    // New Format
                    this.editorJson.set(post.editor_json);

                    // Handle potential string-encoded flow content in editor_json too
                    let flowContent = post.editor_json.flow;
                    if (typeof flowContent === 'string') {
                        try { flowContent = JSON.parse(flowContent); } catch (e) { }
                    }

                    this.content = JSON.parse(JSON.stringify(flowContent));
                } else if (post.content) {
                    // Legacy Format - Migrate
                    try {
                        const sanitized = this.sanitizeContent(post.content) || { type: 'doc', content: [] };
                        this.content = sanitized;

                        // Migrate to new format structure immediately
                        const migratedJson: EditorJSON = {
                            meta: { canvasWidth: CANVAS_WIDTH, canvasPadding: CANVAS_PADDING, version: 1 },
                            flow: sanitized,
                            floating: []
                        };
                        this.editorJson.set(migratedJson);
                    } catch (e) {
                        console.error('Content migration error:', e);
                        this.content = { type: 'doc', content: [] };
                        this.editorJson.set(createEmptyEditorJSON());
                    }
                } else {
                    // Empty new post (fallback)
                    this.content = { type: 'doc', content: [] };
                    this.editorJson.set(createEmptyEditorJSON());
                }

                this.dirty.set(false);
            },
            error: () => this.toast.error('Failed to load post')
        });
    }

    private sanitizeContent(content: any): any {
        console.log('Sanitizing content:', content);
        if (!content) return { type: 'doc', content: [] };

        // Handle double-encoded JSON strings
        if (typeof content === 'string') {
            try {
                content = JSON.parse(content);
                console.log('Parsed string content to object:', content);
            } catch (e) {
                console.error('Failed to parse content string:', e);
                return { type: 'doc', content: [] };
            }
        }

        const sanitizeNode = (node: any): any => {
            if (!node) return node;

            const nodeTypeMap: { [key: string]: string } = {
                'listItem': 'list_item',
                'bulletList': 'bullet_list',
                'orderedList': 'ordered_list',
                'codeBlock': 'code_block',
                'hardBreak': 'hard_break'
            };

            // If node is not an object (primitive), return it
            if (typeof node !== 'object') return node;

            let sanitized = { ...node };
            if (sanitized.type && nodeTypeMap[sanitized.type]) {
                sanitized.type = nodeTypeMap[sanitized.type];
            }
            if (sanitized.content && Array.isArray(sanitized.content)) {
                sanitized.content = sanitized.content.map(sanitizeNode);
            }
            return sanitized;
        };

        const result = sanitizeNode(content);
        console.log('Sanitized result:', result);
        return result;
    }

    // ===== EDITOR JSON SYNC =====
    onContentChange(): void {
        // Sync flow layer with ngx-editor content
        this.editorJson.update(json => ({
            ...json,
            flow: this.content
        }));
        this.markDirty();
    }

    // ===== FLOATING IMAGE MANAGEMENT =====
    onImageSelect(imageId: string): void {
        this.selectedImageId.set(imageId);
    }

    onImagePositionChange(event: { id: string; x: number; y: number }): void {
        this.editorJson.update(json => ({
            ...json,
            floating: json.floating.map(img =>
                img.id === event.id ? { ...img, x: event.x, y: event.y } : img
            )
        }));
        this.markDirty();
    }

    onImageSizeChange(event: { id: string; width: number; height: number }): void {
        this.editorJson.update(json => ({
            ...json,
            floating: json.floating.map(img =>
                img.id === event.id ? { ...img, width: event.width, height: event.height } : img
            )
        }));
        this.markDirty();
    }

    onImageDelete(imageId: string): void {
        this.editorJson.update(json => ({
            ...json,
            floating: json.floating.filter(img => img.id !== imageId)
        }));
        this.selectedImageId.set(null);
        this.markDirty();
        this.toast.success('Image removed');
    }

    bringForward(): void {
        const id = this.selectedImageId();
        if (!id) return;

        this.editorJson.update(json => {
            const maxZ = Math.max(...json.floating.map(f => f.zIndex), 0);
            return {
                ...json,
                floating: json.floating.map(img =>
                    img.id === id ? { ...img, zIndex: maxZ + 1 } : img
                )
            };
        });
        this.markDirty();
    }

    sendBackward(): void {
        const id = this.selectedImageId();
        if (!id) return;

        this.editorJson.update(json => {
            const minZ = Math.min(...json.floating.map(f => f.zIndex), 10);
            return {
                ...json,
                floating: json.floating.map(img =>
                    img.id === id ? { ...img, zIndex: Math.max(1, minZ - 1) } : img
                )
            };
        });
        this.markDirty();
    }

    duplicateSelected(): void {
        const id = this.selectedImageId();
        if (!id) return;

        const original = this.editorJson().floating.find(f => f.id === id);
        if (!original) return;

        const duplicate = createFloatingImage(
            original.src,
            original.width,
            original.height,
            original.x + 20,
            original.y + 20
        );
        duplicate.zIndex = original.zIndex + 1;

        this.editorJson.update(json => ({
            ...json,
            floating: [...json.floating, duplicate]
        }));
        this.selectedImageId.set(duplicate.id);
        this.markDirty();
    }

    alignImage(alignment: 'left' | 'center' | 'right'): void {
        const id = this.selectedImageId();
        if (!id) return;

        this.editorJson.update(json => ({
            ...json,
            floating: json.floating.map(img => {
                if (img.id !== id) return img;

                let newX = img.x;
                switch (alignment) {
                    case 'left':
                        newX = 0;
                        break;
                    case 'center':
                        newX = (CANVAS_INNER_WIDTH - img.width) / 2;
                        break;
                    case 'right':
                        newX = CANVAS_INNER_WIDTH - img.width;
                        break;
                }
                return { ...img, x: newX };
            })
        }));
        this.markDirty();
    }

    // ===== AUTOSAVE =====
    markDirty(): void {
        this.dirty.set(true);
        // Trigger autosave for existing posts
        if (this.isEdit() && this.id()) {
            this.autosave$.next();
        }
    }

    private performAutosave(): void {
        const postId = this.id();
        if (!postId) return;

        this.autoSaving.set(true);

        this.postsService.saveDraft(postId, this.editorJson()).subscribe({
            next: (response) => {
                this.autoSaving.set(false);
                this.lastSavedAt.set(new Date(response.saved_at).toLocaleTimeString());
                // Don't clear dirty flag - user should still manually save
            },
            error: (err) => {
                this.autoSaving.set(false);
                console.error('Autosave failed:', err);
            }
        });
    }

    // ===== PREVIEW =====
    openPreview(): void {
        const previewData = {
            title: this.title,
            slug: this.slug,
            excerpt: this.shortDesc,
            content: this.content,
            editor_json: this.editorJson(),
            cover_image_url: this.cover,
            category: this.category,
            status: this.status,
            meta_title: this.metaTitle,
            meta_description: this.metaDesc
        };

        localStorage.setItem('admin_preview_data', JSON.stringify(previewData));
        const previewUrl = this.isEdit() ? `/admin/preview?id=${this.id()}` : '/admin/preview';
        window.open(previewUrl, '_blank');
    }

    toggleSidebar(): void {
        this.sidebarVisible.update(v => !v);
    }

    generateSlug(): void {
        if (!this.slugManuallyEdited && this.title) {
            this.slug = this.title
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }
    }

    onSlugManualEdit(): void {
        this.slugManuallyEdited = true;
        this.markDirty();
    }

    resetSlugToAuto(): void {
        this.slugManuallyEdited = false;
        this.generateSlug();
        this.markDirty();
    }

    goBack(): void {
        if (this.dirty()) {
            this.showUnsavedModal.set(true);
            return;
        }
        this.router.navigate(['/admin']);
    }

    confirmLeave(): void {
        this.showUnsavedModal.set(false);
        this.dirty.set(false);
        this.router.navigate(['/admin']);
    }

    cancelLeave(): void {
        this.showUnsavedModal.set(false);
    }

    // ===== SAVE POST =====
    savePost(): void {
        if (!this.title || !this.shortDesc) {
            this.toast.warning('Title and short description required');
            return;
        }

        if (!this.slug) this.generateSlug();

        this.saving.set(true);

        const dto: PostDto = {
            title: this.title,
            slug: this.slug,
            excerpt: this.shortDesc,
            content: this.content,
            editor_json: this.editorJson(),
            cover_image_url: this.cover,
            meta_title: this.metaTitle,
            meta_description: this.metaDesc,
            category: this.category,
            status: this.status
        };

        const request = this.isEdit()
            ? this.postsService.update(this.id()!, dto)
            : this.postsService.create(dto);

        request.subscribe({
            next: (savedPost) => {
                this.saving.set(false);
                this.dirty.set(false);
                this.toast.success(this.isEdit() ? 'Post updated!' : 'Post created!');

                if (!this.isEdit() && savedPost?.id) {
                    // Navigate to edit mode for new post
                    this.router.navigate(['/admin/editor', savedPost.id]);
                }
            },
            error: (err) => {
                this.saving.set(false);
                this.toast.error(err.error?.message || 'Failed to save post');
            }
        });
    }

    // ===== IMAGE UPLOAD FOR FLOATING LAYER =====
    triggerEditorImageUpload(): void {
        this.editorImageInput.nativeElement.click();
    }

    onEditorImageUpload(event: Event): void {
        this.editorImageEvent = event;
        this.showEditorImageCropper = true;
    }

    // Upload lock to prevent double-adding
    private isUploadingEditorImage = false;

    onEditorImageCropConfirm(result: ImageUploadResult): void {
        // GUARD: Prevent double upload
        if (this.isUploadingEditorImage) {
            console.warn('Upload already in progress, ignoring duplicate call');
            return;
        }
        this.isUploadingEditorImage = true;

        const file = new File([result.blob], 'editor-image.png', { type: 'image/png' });

        this.mediaService.upload(file).subscribe({
            next: (media) => {
                // Use cropped dimensions from the cropper modal
                const imgWidth = result.width;
                const imgHeight = result.height;

                // Create floating image at center of visible canvas
                const newImage = createFloatingImage(
                    media.url,
                    imgWidth,
                    imgHeight,
                    (CANVAS_INNER_WIDTH - imgWidth) / 2, // center X
                    100 // Y offset from top
                );

                this.editorJson.update(json => ({
                    ...json,
                    floating: [...json.floating, newImage]
                }));

                this.selectedImageId.set(newImage.id);
                this.markDirty();
                this.onEditorImageCropCancel();
                this.toast.success('Image added to canvas');
                this.isUploadingEditorImage = false; // Release lock
            },
            error: (err) => {
                console.error('Upload Error:', err);
                if (err.status === 401) {
                    this.toast.error('Session expired. Please login again.');
                } else {
                    this.toast.error('Upload failed. Check console.');
                }
                this.onEditorImageCropCancel();
                this.isUploadingEditorImage = false; // Release lock on error
            }
        });
    }

    onEditorImageCropCancel(): void {
        this.showEditorImageCropper = false;
        this.editorImageEvent = '';
        if (this.editorImageInput) this.editorImageInput.nativeElement.value = '';
    }

    // ===== COVER IMAGE =====
    onCoverUpload(event: Event): void {
        this.imageEvent = event;
        this.showCropper = true;
    }

    onCropConfirm(blob: Blob): void {
        const file = new File([blob], 'cover-image.png', { type: 'image/png' });

        this.mediaService.upload(file).subscribe({
            next: (media) => {
                this.cover = media.url;
                this.markDirty();
                this.onCropCancel();
            },
            error: (err) => {
                console.error('Upload Error:', err);
                if (err.status === 401) {
                    this.toast.error('Session expired. Please login again.');
                } else {
                    this.toast.error('Failed to upload cover image. Check console for details.');
                }
            }
        });
    }

    onCropCancel(): void {
        this.showCropper = false;
        this.imageEvent = '';
        if (this.coverInput) this.coverInput.nativeElement.value = '';
    }

    removeCover(): void {
        this.cover = '';
        this.markDirty();
    }

    // ===== FILE EMBEDS =====
    triggerEmbedFileUpload(): void {
        this.embedFileInput.nativeElement.click();
    }

    onEmbedFileUpload(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        this.uploadingFile = true;

        this.mediaService.upload(file).subscribe({
            next: (media) => {
                this.uploadedFiles.unshift(media);
                this.uploadingFile = false;
            },
            error: (err) => {
                console.error('Upload Error:', err);
                this.toast.error('File upload failed');
                this.uploadingFile = false;
            }
        });

        input.value = '';
    }

    copyToClipboard(url: string): void {
        navigator.clipboard.writeText(url).then(() => {
            this.copiedUrl = url;
            setTimeout(() => this.copiedUrl = '', 2000);
        });
    }

    removeUploadedFile(index: number): void {
        this.uploadedFiles.splice(index, 1);
    }
}
