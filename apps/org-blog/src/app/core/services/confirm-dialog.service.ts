import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

@Injectable({
    providedIn: 'root'
})
export class ConfirmDialogService {
    visible = signal(false);
    options = signal<ConfirmOptions>({ message: '' });

    private resolveRef: ((value: boolean) => void) | null = null;

    confirm(options: ConfirmOptions): Promise<boolean> {
        this.options.set({
            title: options.title || 'Confirm Action',
            message: options.message,
            confirmText: options.confirmText || 'Confirm',
            cancelText: options.cancelText || 'Cancel',
            type: options.type || 'danger'
        });
        this.visible.set(true);

        return new Promise<boolean>((resolve) => {
            this.resolveRef = resolve;
        });
    }

    handleConfirm(): void {
        this.visible.set(false);
        this.resolveRef?.(true);
        this.resolveRef = null;
    }

    handleCancel(): void {
        this.visible.set(false);
        this.resolveRef?.(false);
        this.resolveRef = null;
    }
}
