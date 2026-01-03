import { Component, OnInit, OnDestroy, signal, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { PostsService } from '@core/services/posts.service';
import { MediaService, MediaFile } from '@core/services/media.service';
import { ToastService } from '@core/services/toast.service';
import { PostDto, PostCategory, PostStatus } from '@shared/models/post.model';
import { Editor, Toolbar, NgxEditorModule } from 'ngx-editor';
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

    // Cropper State
    showCropper = false;
    imageEvent: any = '';

    // Editor
    editor!: Editor;
    toolbar: Toolbar = [
        ['bold', 'italic'],
        ['underline', 'strike'],
        ['code', 'blockquote'],
        ['ordered_list', 'bullet_list'],
        [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
        ['link', 'align_left', 'align_center', 'align_right', 'align_justify'],
        ['text_color', 'background_color'],
    ];

    // Form fields
    title = '';
    shortDesc = '';
    slug = '';
    slugManuallyEdited = false;  // Track if slug was manually edited
    metaTitle = '';
    metaDesc = '';
    category: PostCategory = 'blog';
    status: PostStatus = 'draft';
    cover = '';
    content: any = { type: 'doc', content: [] };

    // Categories
    categories: PostCategory[] = ['blog', 'scam_alert', 'osint_guide', 'resource', 'case_studies'];

    // File upload section
    uploadedFiles: MediaFile[] = [];
    uploadingFile = false;
    copiedUrl = '';

    // VS Code-style color palette for text/background colors
    colorPresets: string[] = [
        // Row 1 - Basic colors
        '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
        // Row 2 - Reds
        '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
        // Row 3 - Lighter versions
        '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
        // Row 4 - Medium versions  
        '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
        // Row 5 - Darker versions
        '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
        // Row 6 - Dark versions
        '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79',
        // Row 7 - Very dark
        '#85200c', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#1155cc', '#0b5394', '#351c75', '#741b47',
        // Row 8 - Darkest
        '#5b0f00', '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#1c4587', '#073763', '#20124d', '#4c1130'
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

    ngOnInit(): void {
        this.editor = new Editor();

        // Load existing media files from library
        this.loadMediaFiles();

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.id.set(id);
            this.isEdit.set(true);
            this.loadPost(id);
        }
    }

    loadMediaFiles(): void {
        this.mediaService.getAll().subscribe({
            next: (mediaList) => {
                // Combine covers and files, most recent first
                const allFiles = [
                    ...mediaList.files.map(f => ({ ...f, type: 'file' as const })),
                    ...mediaList.covers.map(f => ({ ...f, type: 'image' as const }))
                ];
                this.uploadedFiles = allFiles.slice(0, 20); // Show last 20 files
            },
            error: (err) => {
                console.error('Failed to load media files:', err);
            }
        });
    }

    ngOnDestroy(): void {
        this.editor.destroy();
    }

    loadPost(id: string): void {
        this.postsService.getById(id).subscribe({
            next: (post) => {
                this.title = post.title;
                this.slug = post.slug;
                this.slugManuallyEdited = true; // Existing post - treat slug as manually set
                this.shortDesc = post.excerpt;
                this.metaTitle = post.meta_title || '';
                this.metaDesc = post.meta_description || '';
                this.category = post.category;
                this.status = post.status;
                this.cover = post.cover_image_url || '';
                this.content = post.content || { type: 'doc', content: [] };
                this.dirty.set(false);
            },
            error: () => {
                this.toast.error('Failed to load post');
            }
        });
    }

    generateSlug(): void {
        // Always regenerate slug from title (unless manually edited)
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

    savePost(): void {
        if (!this.title || !this.shortDesc) {
            this.toast.warning('Title and short description required');
            return;
        }

        // Auto-generate slug if empty
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
                this.toast.success(this.isEdit() ? 'Post updated successfully!' : 'Post created successfully!');

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
                this.toast.error('Failed to upload cover image');
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
            const { schema } = state;

            // Create an image node
            const imageNode = schema.nodes['image'].create({ src: url });

            // Insert it at current selection
            const tr = state.tr.replaceSelectionWith(imageNode);
            dispatch(tr);

            // Focus back to editor
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
                this.toast.error('Upload failed');
            }
        });

        input.value = '';
    }

    removeCover(): void {
        this.cover = '';
        this.markDirty();
    }

    // ===== FILE UPLOAD FOR EMBEDDING =====
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
