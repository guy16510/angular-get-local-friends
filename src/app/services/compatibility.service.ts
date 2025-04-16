import { Injectable } from '@angular/core';
import { from, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { CompatibilityInsights } from '../models/compatibility';

@Injectable({
  providedIn: 'root'
})
export class CompatibilityService {
  private client = generateClient<Schema>();

  generateInsights(targetUserId: string): Observable<CompatibilityInsights> {
    return from(this.client.queries.generateCompatibilityInsights({ targetUserId })).pipe(
      map((result: any) => {
        if (!result?.data) {
          throw new Error('No data returned from compatibility insights');
        }
        return result.data as CompatibilityInsights;
      }),
      catchError(err => {
        console.error('[CompatibilityService] generateInsights error:', err);
        return throwError(() => err);
      })
    );
  }
} 