import { Component, inject } from '@angular/core';
import { ConfirmDialogService } from '@core/services/confirm-dialog.service';

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    template: `
        @if (dialogService.visible()) {
        <div class="dialog-backdrop" (click)="dialogService.handleCancel()">
            <div class="dialog-box" [class]="dialogService.options().type" (click)="$event.stopPropagation()">
                <div class="dialog-icon">
                    @switch (dialogService.options().type) {
                        @case ('danger') {
                            <span class="material-icons-round">warning</span>
                        }
                        @case ('warning') {
                            <span class="material-icons-round">error_outline</span>
                        }
                        @default {
                            <span class="material-icons-round">help_outline</span>
                        }
                    }
                </div>
                <h3 class="dialog-title">{{ dialogService.options().title }}</h3>
                <p class="dialog-message">{{ dialogService.options().message }}</p>
                <div class="dialog-actions">
                    <button class="btn-cancel" (click)="dialogService.handleCancel()">
                        {{ dialogService.options().cancelText }}
                    </button>
                    <button class="btn-confirm" [class]="dialogService.options().type" (click)="dialogService.handleConfirm()">
                        {{ dialogService.options().confirmText }}
                    </button>
                </div>
            </div>
        </div>
        }
    `,
    styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
    dialogService = inject(ConfirmDialogService);
}
