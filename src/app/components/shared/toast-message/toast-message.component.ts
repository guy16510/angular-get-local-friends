import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { ToastConfig } from '../../../services/toast-message.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-toast-message',
  template: `
    <div class="toast-container">
      <mat-icon [class]="data.type">
        {{ getIcon() }}
      </mat-icon>
      <span class="message">{{ data.message }}</span>
      <button mat-button *ngIf="data.action" (click)="dismiss()">
        {{ data.action }}
      </button>
    </div>
  `,
  styles: [`
    .toast-container {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 8px;
    }

    .message {
      flex: 1;
    }

    mat-icon {
      margin-right: 8px;
    }

    mat-icon.success {
      color: #4caf50;
    }

    mat-icon.error {
      color: #f44336;
    }

    mat-icon.warning {
      color: #ff9800;
    }

    mat-icon.info {
      color: #2196f3;
    }
  `],
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule]
})
export class ToastMessageComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: ToastConfig,
    private snackBarRef: MatSnackBarRef<ToastMessageComponent>
  ) {}

  getIcon(): string {
    switch (this.data.type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  }

  dismiss(): void {
    this.snackBarRef.dismiss();
  }
}

/*
<app-toast-message 
  [message]="'Something went wrong!'" 
  [action]="'Retry'" 
  [duration]="3000" 
  type="error">
</app-toast-message>
<app-toast-message
  [message]="'An error occurred! Please check your input.'"
  [action]="'Dismiss'"
  [persistent]="true"
  type="error">
</app-toast-message>
<app-toast-message
  [message]="'An error occurred! Please check your input.'"
  [action]="'Dismiss'"
  [persistent]="true"
  type="warning">
</app-toast-message>
*/