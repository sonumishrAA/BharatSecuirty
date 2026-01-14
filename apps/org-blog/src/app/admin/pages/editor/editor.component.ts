import { Component, OnInit, OnDestroy, signal, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { PostsService } from '@core/services/posts.service';
import { MediaService, MediaFile } from '@core/services/media.service';
import { ToastService } from '@core/services/toast.service';
import { PostDto, PostCategory, PostStatus } from '@shared/models/post.model';
import { Editor, Toolbar, NgxEditorModule } from 'ngx-editor';
import { schema } from 'ngx-editor/schema';
import { ImageCropperModalComponent } from '../../../shared/components/image-cropper-modal/image-cropper-modal.component';

@Component({
    selector: 'app-editor',
    standalone: true,
    imports: [FormsModule, TitleCasePipe, NgxEditorModule, ImageCropperModalComponent],
    templateUrl: './editor.component.html',
    styleUrl: './editor.component.scss'
})
export class EditorComponent implements OnInit, OnDestroy {
    // State
    id = signal<string | null>(null);
    isEdit = signal(false);
    dirty = signal(false);
    saving = signal(false);

    // UI State
    sidebarVisible = signal(false);
    showUnsavedModal = signal(false);

    // Cropper State
    showCropper = false;
    imageEvent: any = '';

    // Editor - initialize with proper schema
    editor!: Editor;
    // Enhanced toolbar with more tools like Google Docs
    toolbar: Toolbar = [
        // History
        ['undo', 'redo'],
        // Text formatting
        ['bold', 'italic', 'underline', 'strike'],
        // Code & Quote
        ['code', 'blockquote'],
        // Lists
        ['ordered_list', 'bullet_list'],
        // Headings
        [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
        // Links & Alignment
        ['link'],
        ['align_left', 'align_center', 'align_right', 'align_justify'],
        // Colors
        ['text_color', 'background_color'],
        // Extra
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

    // Categories - REMOVED case_studies
    categories: PostCategory[] = ['blog', 'scam_alert', 'osint_guide', 'resource'];

    // File upload section
    uploadedFiles: MediaFile[] = [];
    uploadingFile = false;
    copiedUrl = '';

    // Extended color palette - More colors for better selection
    colorPresets: string[] = [
        // Grayscale
        '#000000', '#1a1a1a', '#333333', '#4d4d4d', '#666666', '#808080', '#999999', '#b3b3b3', '#cccccc', '#e6e6e6', '#f2f2f2', '#ffffff',
        // Reds
        '#330000', '#660000', '#990000', '#cc0000', '#ff0000', '#ff3333', '#ff6666', '#ff9999', '#ffcccc', '#ffe6e6',
        // Oranges
        '#331a00', '#663300', '#994d00', '#cc6600', '#ff8000', '#ff9933', '#ffb366', '#ffcc99', '#ffe6cc',
        // Yellows
        '#333300', '#666600', '#999900', '#cccc00', '#ffff00', '#ffff33', '#ffff66', '#ffff99', '#ffffcc',
        // Greens
        '#003300', '#006600', '#009900', '#00cc00', '#00ff00', '#33ff33', '#66ff66', '#99ff99', '#ccffcc',
        // Cyans
        '#003333', '#006666', '#009999', '#00cccc', '#00ffff', '#33ffff', '#66ffff', '#99ffff', '#ccffff',
        // Blues
        '#000033', '#000066', '#000099', '#0000cc', '#0000ff', '#3333ff', '#6666ff', '#9999ff', '#ccccff',
        // Purples
        '#330033', '#660066', '#990099', '#cc00cc', '#ff00ff', '#ff33ff', '#ff66ff', '#ff99ff', '#ffccff',
        // Deep Forest & Terracotta (from screenshot)
        '#052e16', '#14532d', '#166534', '#15803d', '#16a34a', '#22c55e', '#4ade80', '#86efac',
        '#9a3412', '#c2410c', '#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa',
    ];

    @ViewChild('editorImageInput') editorImageInput!: ElementRef<HTMLInputElement>;
    @ViewChild('coverInput') coverInput!: ElementRef<HTMLInputElement>;
    @ViewChild('embedFileInput') embedFileInput!: ElementRef<HTMLInputElement>;

    constructor(
        private route: ActivatedRoute,
        public router: Router,
        private postsService: PostsService,
        private mediaService: MediaService,
        private toast: ToastService
    ) { }

    // ===== UNSAVED CHANGES WARNING =====
    @HostListener('window:beforeunload', ['$event'])
    onBeforeUnload(event: BeforeUnloadEvent): void {
        if (this.dirty()) {
            event.preventDefault();
            event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        }
    }

    ngOnInit(): void {
        // Initialize editor with the built-in schema that includes all node types
        this.editor = new Editor({
            schema: schema  // Use the built-in schema from ngx-editor
        });

        this.loadMediaFiles();

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.id.set(id);
            this.isEdit.set(true);
            this.loadPost(id);
        }

        // Show login warning on page load
        this.showLoginWarning();
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
            error: (err) => {
                console.error('Failed to load media files:', err);
            }
        });
    }

    ngOnDestroy(): void {
        this.editor.destroy();
        localStorage.removeItem('admin_preview_data');
    }

    toggleSidebar(): void {
        this.sidebarVisible.update(v => !v);
    }

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

                // Sanitize content to fix node type naming issues
                try {
                    this.content = this.sanitizeContent(post.content) || { type: 'doc', content: [] };
                } catch (e) {
                    console.error('Content sanitization error:', e);
                    this.content = { type: 'doc', content: [] };
                    this.toast.warning('Content format issue - some content may not load correctly');
                }

                this.dirty.set(false);
            },
            error: () => {
                this.toast.error('Failed to load post');
            }
        });
    }

    // Sanitize content to fix node type naming mismatches
    private sanitizeContent(content: any): any {
        if (!content) return { type: 'doc', content: [] };

        const sanitizeNode = (node: any): any => {
            if (!node) return node;

            // Map incorrect node type names to correct ones
            const nodeTypeMap: { [key: string]: string } = {
                'listItem': 'list_item',
                'bulletList': 'bullet_list',
                'orderedList': 'ordered_list',
                'codeBlock': 'code_block',
                'hardBreak': 'hard_break'
            };

            let sanitized = { ...node };

            // Fix node type if needed
            if (sanitized.type && nodeTypeMap[sanitized.type]) {
                sanitized.type = nodeTypeMap[sanitized.type];
            }

            // Recursively sanitize child content
            if (sanitized.content && Array.isArray(sanitized.content)) {
                sanitized.content = sanitized.content.map(sanitizeNode);
            }

            return sanitized;
        };

        return sanitizeNode(content);
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

    markDirty(): void {
        this.dirty.set(true);
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
        this.dirty.set(false); // Prevent beforeunload from firing
        this.router.navigate(['/admin']);
    }

    cancelLeave(): void {
        this.showUnsavedModal.set(false);
    }

    savePost(): void {
        if (!this.title || !this.shortDesc) {
            this.toast.warning('Title and short description required');
            return;
        }

        if (!this.slug) {
            this.generateSlug();
        }

        this.saving.set(true);

        const dto: PostDto = {
            title: this.title,
            slug: this.slug,
            excerpt: this.shortDesc,
            content: this.content,
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
            next: () => {
                this.saving.set(false);
                this.dirty.set(false);
                this.toast.success(this.isEdit() ? 'Post updated!' : 'Post created!');

                if (!this.isEdit()) {
                    this.router.navigate(['/admin']);
                }
            },
            error: (err) => {
                this.saving.set(false);
                this.toast.error(err.error?.message || 'Failed to save post');
            }
        });
    }

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
                    // Optional: this.router.navigate(['/login']);
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

    triggerEditorImageUpload(): void {
        this.editorImageInput.nativeElement.click();
    }

    onEditorImageUpload(event: Event): void {
        this.handleUpload(event, (url) => {
            const { state, dispatch } = this.editor.view;
            const { schema: editorSchema } = state;
            const imageNode = editorSchema.nodes['image'].create({ src: url });
            const tr = state.tr.replaceSelectionWith(imageNode);
            dispatch(tr);
            this.editor.view.focus();
        });
    }

    private handleUpload(event: Event, callback: (url: string) => void): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        this.mediaService.upload(file).subscribe({
            next: (media) => {
                callback(media.url);
            },
            error: (err) => {
                console.error('Upload Error:', err);
                if (err.status === 401) {
                    this.toast.error('Session expired. Please login again.');
                } else {
                    this.toast.error('Upload failed. Check console.');
                }
            }
        });

        input.value = '';
    }

    removeCover(): void {
        this.cover = '';
        this.markDirty();
    }

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
            setTimeout(() => {
                this.copiedUrl = '';
            }, 2000);
        });
    }

    removeUploadedFile(index: number): void {
        this.uploadedFiles.splice(index, 1);
    }
}
