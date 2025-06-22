import { Injectable } from '@angular/core';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { from, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ToastMessageService } from './toast-message.service';

const client = generateClient<Schema>();

@Injectable({ providedIn: 'root' })
export class BlockService {
  constructor(private toastService: ToastMessageService) {}

  blockUser(blockedUserId: string): Observable<any> {
    return from(client.mutations.blockUser({ blockedUserId })).pipe(
      map((result: any) => {
        if (result.errors?.length) {
          throw new Error('GraphQL error: ' + result.errors.join(', '));
        }
        return result.data;
      }),
      catchError(err => {
        console.error('Error blocking user:', err);
        this.toastService.error('Failed to block user. Please try again.', 'Close');
        throw err;
      })
    );
  }
}
