import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { CreateReportInput } from '../../models/report.model';
import { ToastMessageService } from '../../services/toast-message.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-report-user',
  templateUrl: './report-user.component.html',
  styleUrls: ['./report-user.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ]
})
export class ReportUserComponent {
  reportForm: FormGroup;
  isSubmitting = false;

  constructor(
    public dialogRef: MatDialogRef<ReportUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      reportedUserId: string;
      conversationId: string;
      messageId?: string;
      userName: string;
    },
    private fb: FormBuilder,
    private reportService: ReportService,
    private toastService: ToastMessageService
  ) {
    this.reportForm = this.fb.group({
      reason: ['', Validators.required],
      details: ['']
    });
  }

  async submitReport(): Promise<void> {
    if (!this.reportForm.valid) {
      this.toastService.error('Please fill in all required fields.', 'Close', 5000);
      return;
    }

    if (!this.data.conversationId) {
      this.toastService.error('Conversation ID is required.', 'Close', 5000);
      return;
    }

    this.isSubmitting = true;

    try {
      const input: CreateReportInput = {
        reportedUserId: this.data.reportedUserId,
        conversationId: this.data.conversationId,
        messageId: this.data.messageId,
        reason: this.reportForm.get('reason')?.value,
        details: this.reportForm.get('details')?.value
      };

      await this.reportService.createReport(input).toPromise();
      this.toastService.success('Report submitted successfully.', 'Close');
      this.dialogRef.close(true);
    } catch (error) {
      console.error('Error submitting report:', error);
      this.toastService.error('Failed to submit report. Please try again.', 'Close', 5000);
    } finally {
      this.isSubmitting = false;
    }
  }
} 