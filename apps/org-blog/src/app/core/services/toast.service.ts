import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private nextId = 0;
    toasts = signal<Toast[]>([]);

    show(message: string, type: ToastType = 'info', duration = 4000): void {
        const id = this.nextId++;
        const toast: Toast = { id, message, type };

        this.toasts.update(toasts => [...toasts, toast]);

        // Auto remove after duration
        setTimeout(() => this.remove(id), duration);
    }

    success(message: string): void {
        this.show(message, 'success');
    }

    error(message: string): void {
        this.show(message, 'error', 5000);
    }

    warning(message: string): void {
        this.show(message, 'warning');
    }

    info(message: string): void {
        this.show(message, 'info');
    }

    remove(id: number): void {
        this.toasts.update(toasts => toasts.filter(t => t.id !== id));
    }
}
