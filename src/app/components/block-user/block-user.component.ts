import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { BlockService } from '../../services/block.service';
import { ToastMessageService } from '../../services/toast-message.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-block-user',
  templateUrl: './block-user.component.html',
  styleUrls: ['./block-user.component.scss'],
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule]
})
export class BlockUserComponent {
  isSubmitting = false;

  constructor(
    public dialogRef: MatDialogRef<BlockUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { blockedUserId: string; userName: string },
    private blockService: BlockService,
    private toastService: ToastMessageService
  ) {}

  confirmBlock(): void {
    this.isSubmitting = true;
    this.blockService.blockUser(this.data.blockedUserId).subscribe({
      next: () => {
        this.toastService.success('User blocked successfully.', 'Close');
        this.dialogRef.close(true);
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }
}
