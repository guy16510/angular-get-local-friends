import { Injectable } from '@angular/core';
import { Report, CreateReportInput } from '../models/report.model';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

const client = generateClient<Schema>();

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  createReport(input: CreateReportInput): Observable<Report> {
    return from(client.mutations.createReport(input)).pipe(
      map(result => {
        if (result.errors?.length) {
          throw new Error('GraphQL error: ' + result.errors.join(', '));
        }
        return result.data as Report;
      })
    );
  }
} 