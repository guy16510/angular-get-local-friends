import { Injectable } from '@angular/core';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../../amplify/data/resource';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ToastMessageService } from './toast-message.service';
import { CreateReportInput } from '../models/report.model';

const client = generateClient<Schema>();

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  constructor(private toastService: ToastMessageService) {}

  createReport(input: CreateReportInput): Observable<any> {
    return from(client.mutations.customCreateReport({
      reportedUserId: input.reportedUserId,
      conversationId: input.conversationId,
      messageId: input.messageId,
      reason: input.reason
    })).pipe(
      map(response => {
        if (response.errors?.length) {
          throw new Error('GraphQL error: ' + response.errors.join(', '));
        }
        return response.data;
      }),
      catchError(error => {
        console.error('Error creating report:', error);
        this.toastService.error('Failed to submit report. Please try again.', 'Close');
        throw error;
      })
    );
  }
} 