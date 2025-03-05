import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-toast-message',
  template: '' // This component shows the snackbar immediately on init.
  // encapsulation: ViewEncapsulation.None  // This makes the CSS global
})
export class ToastMessageComponent implements OnInit {
  @Input() message: string = '';
  @Input() action: string = '';
  /**
   * Duration (in milliseconds) for non-persistent toast.
   * Ignored if persistent is true.
   */
  @Input() duration: number = 3000;
  /**
   * Set persistent to true to disable auto-dismiss.
   */
  @Input() persistent: boolean = false;
  @Input() type: 'success' | 'info' | 'warning' | 'error' = 'info';

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    const config = {
      // When persistent, duration is set to 0 (snackbar will not auto-dismiss)
      duration: this.persistent ? 0 : this.duration,
      panelClass: [this.getPanelClass()]
    };
    this.snackBar.open(this.message, this.action, config);
  }

  private getPanelClass(): string {
    switch (this.type) {
      case 'success': return 'toast-success';
      case 'error': return 'toast-error';
      case 'warning': return 'toast-warning';
      default: return 'toast-info';
    }
  }
}