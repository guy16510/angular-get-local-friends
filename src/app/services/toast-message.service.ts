import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastMessageComponent } from '../components/shared/toast-message/toast-message.component';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastConfig {
  message: string;
  action?: string;
  duration?: number;
  persistent?: boolean;
  type?: ToastType;
}

@Injectable({
  providedIn: 'root'
})
export class ToastMessageService {
  constructor(private snackBar: MatSnackBar) {}

  show(config: ToastConfig): void {
    const defaultConfig = {
      duration: 3000,
      persistent: false,
      type: 'info' as ToastType,
      action: 'Dismiss'
    };

    const finalConfig = { ...defaultConfig, ...config };

    this.snackBar.openFromComponent(ToastMessageComponent, {
      data: finalConfig,
      duration: finalConfig.persistent ? undefined : finalConfig.duration,
      panelClass: [`toast-${finalConfig.type}`],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  success(message: string, action?: string, duration?: number): void {
    this.show({ message, action, duration, type: 'success' });
  }

  error(message: string, action?: string, duration?: number): void {
    this.show({ message, action, duration, type: 'error' });
  }

  warning(message: string, action?: string, duration?: number): void {
    this.show({ message, action, duration, type: 'warning' });
  }

  info(message: string, action?: string, duration?: number): void {
    this.show({ message, action, duration, type: 'info' });
  }
} 