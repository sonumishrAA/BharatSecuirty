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
                    <span class="toast-icon">
                        @switch (toast.type) {
                            @case ('success') { ✓ }
                            @case ('error') { ✕ }
                            @case ('warning') { ⚠ }
                            @case ('info') { ℹ }
                        }
                    </span>
                    <span class="toast-message">{{ toast.message }}</span>
                    <button class="toast-close">×</button>
                </div>
            }
        </div>
    `,
    styles: [`
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 380px;
        }

        .toast {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 18px;
            border-radius: 12px;
            background: #1e293b;
            color: white;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            cursor: pointer;
            animation: slideIn 0.3s ease;
            border-left: 4px solid;
        }

        .toast.success {
            border-color: #22c55e;
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), #1e293b);
        }

        .toast.error {
            border-color: #ef4444;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), #1e293b);
        }

        .toast.warning {
            border-color: #f59e0b;
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), #1e293b);
        }

        .toast.info {
            border-color: #22d3ee;
            background: linear-gradient(135deg, rgba(34, 211, 238, 0.15), #1e293b);
        }

        .toast-icon {
            font-size: 18px;
            font-weight: bold;
        }

        .toast.success .toast-icon { color: #22c55e; }
        .toast.error .toast-icon { color: #ef4444; }
        .toast.warning .toast-icon { color: #f59e0b; }
        .toast.info .toast-icon { color: #22d3ee; }

        .toast-message {
            flex: 1;
            font-size: 14px;
            line-height: 1.4;
        }

        .toast-close {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.5);
            font-size: 20px;
            cursor: pointer;
            padding: 0 4px;
            line-height: 1;
        }

        .toast-close:hover {
            color: white;
        }

        @keyframes slideIn {
            from {
                transform: translateX(100%);
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
