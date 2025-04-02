import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ReportService } from '../../services/report.service';
import { CreateReportInput } from '../../models/report.model';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-report-user',
  templateUrl: './report-user.component.html',
  styleUrls: ['./report-user.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MaterialModule
  ]
})
export class ReportUserComponent {
  reason: string = '';
  isSubmitting: boolean = false;
  error: string | null = null;
  isValidLength: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<ReportUserComponent>,
    private reportService: ReportService,
    @Inject(MAT_DIALOG_DATA) public data: {
      reportedUserId: string;
      conversationId: string;
      messageId?: string;
      userName: string;
    }
  ) {}

  onReasonInput() {
    this.isValidLength = this.reason.length >= 25;
  }

  submitReport() {
    if (!this.reason.trim()) {
      this.error = 'Please provide a reason for reporting';
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    const input: CreateReportInput = {
      reportedUserId: this.data.reportedUserId,
      conversationId: this.data.conversationId,
      messageId: this.data.messageId,
      reason: this.reason
    };

    this.reportService.createReport(input).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.error = 'Failed to submit report. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }
} 