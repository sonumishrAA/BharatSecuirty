import { Component, inject } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [],
    template: `
        <div class="toast-container">
            @for (toast of toastService.toasts(); track toast.id) {
                <div class="toast" [class]="toast.type" (click)="toastService.remove(toast.id)">
                    <span class="toast-icon material-icons-round">
                        @switch (toast.type) {
                            @case ('success') { check_circle }
                            @case ('error') { error }
                            @case ('warning') { warning }
                            @case ('info') { info }
                        }
                    </span>
                    <span class="toast-message">{{ toast.message }}</span>
                    <button class="toast-close">
                        <span class="material-icons-round">close</span>
                    </button>
                </div>
            }
        </div>
    `,
    styles: [`
        .toast-container {
            position: fixed;
            top: 24px;
            right: 24px;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 12px;
            max-width: 400px;
        }

        .toast {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 20px;
            border-radius: 12px;
            background: white;
            color: #0f172a;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05);
            cursor: pointer;
            animation: slideIn 0.35s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            border-left: 4px solid;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .toast:hover {
            transform: translateX(-4px);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        }

        .toast.success {
            border-color: #10b981;
        }
        .toast.success .toast-icon { color: #10b981; }

        .toast.error {
            border-color: #ef4444;
        }
        .toast.error .toast-icon { color: #ef4444; }

        .toast.warning {
            border-color: #f59e0b;
        }
        .toast.warning .toast-icon { color: #f59e0b; }

        .toast.info {
            border-color: #3b82f6;
        }
        .toast.info .toast-icon { color: #3b82f6; }

        .toast-icon {
            font-size: 22px;
            flex-shrink: 0;
        }

        .toast-message {
            flex: 1;
            font-size: 14px;
            line-height: 1.5;
            font-weight: 500;
        }

        .toast-close {
            background: transparent;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: all 0.15s ease;
        }
        
        .toast-close .material-icons-round {
            font-size: 18px;
        }

        .toast-close:hover {
            background: #f1f5f9;
            color: #0f172a;
        }

        @keyframes slideIn {
            from {
                transform: translateX(120%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `]
})
export class ToastComponent {
    toastService = inject(ToastService);
}
