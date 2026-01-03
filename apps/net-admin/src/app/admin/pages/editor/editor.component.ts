import { Component, OnInit, OnDestroy, signal, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JsonPipe, TitleCasePipe } from '@angular/common';
import { PostsService } from '@core/services/posts.service';
import { MediaService } from '@core/services/media.service';
import { PostDto, PostCategory, PostStatus } from '@shared/models/post.model';
import { Editor, Toolbar, NgxEditorModule } from 'ngx-editor';
import { ImageCropperModalComponent } from '../../../shared/components/image-cropper-modal/image-cropper-modal.component';

@Component({
    selector: 'app-editor',
    standalone: true,
    imports: [FormsModule, JsonPipe, TitleCasePipe, NgxEditorModule, ImageCropperModalComponent],
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
    metaTitle = '';
    metaDesc = '';
    category: PostCategory = 'blog';
    status: PostStatus = 'draft';
    cover = '';
    content: any = { type: 'doc', content: [] };

    // Categories
    categories: PostCategory[] = ['blog', 'scam_alert', 'osint_guide', 'resource'];

    @ViewChild('editorImageInput') editorImageInput!: ElementRef<HTMLInputElement>;
    @ViewChild('coverInput') coverInput!: ElementRef<HTMLInputElement>;

    constructor(
        private route: ActivatedRoute,
        public router: Router,
        private postsService: PostsService,
        private mediaService: MediaService
    ) { }

    ngOnInit(): void {
        this.editor = new Editor();

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.id.set(id);
            this.isEdit.set(true);
            this.loadPost(id);
        }
    }

    ngOnDestroy(): void {
        this.editor.destroy();
    }

    loadPost(id: string): void {
        this.postsService.getById(id).subscribe({
            next: (post) => {
                this.title = post.title;
                this.slug = post.slug;
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
                alert('Failed to load post');
            }
        });
    }

    autoSlug(): void {
        if (!this.slug && this.title) {
            this.slug = this.title
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }
    }

    markDirty(): void {
        this.dirty.set(true);
    }

    savePost(): void {
        if (!this.title || !this.shortDesc) {
            alert('Title and short description required');
            return;
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
                alert(this.isEdit() ? 'Post updated' : 'Post created');

                if (!this.isEdit()) {
                    this.router.navigate(['/admin']);
                }
            },
            error: (err) => {
                this.saving.set(false);
                alert(err.error?.message || 'Failed to save post');
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
                alert('Failed to upload cover image. Check console for details.');
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
                alert('Upload failed');
            }
        });

        input.value = '';
    }

    removeCover(): void {
        this.cover = '';
        this.markDirty();
    }
}
