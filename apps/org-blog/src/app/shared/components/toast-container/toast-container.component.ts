import { Component, inject } from '@angular/core';
import { ToastService, Toast } from '@core/services/toast.service';

@Component({
    selector: 'app-toast-container',
    standalone: true,
    template: `
        <div class="toast-container">
            @for (toast of toastService.toasts(); track toast.id) {
            <div class="toast" [class]="toast.type" (click)="toastService.remove(toast.id)">
                <span class="toast-icon material-icons-round">
                    @switch (toast.type) {
                        @case ('success') { check_circle }
                        @case ('error') { error }
                        @case ('warning') { warning }
                        @default { info }
                    }
                </span>
                <span class="toast-message">{{ toast.message }}</span>
                <button class="toast-close" (click)="toastService.remove(toast.id)">
                    <span class="material-icons-round">close</span>
                </button>
            </div>
            }
        </div>
    `,
    styleUrl: './toast-container.component.scss'
})
export class ToastContainerComponent {
    toastService = inject(ToastService);
}
