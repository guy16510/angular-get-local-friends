import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>({
  authMode: 'userPool'
});

@Injectable({ providedIn: 'root' })
export class ChatService {
  sendMessage(recipientId: string, text: string): Observable<any> {
    const payload = { recipientId, text };

    return from(client.mutations.createMessage(payload)).pipe(
      map(result => {
        if (Array.isArray(result.errors) && result.errors.length > 0) {
          throw new Error(result.errors[0].message);
        }
        return result.data; // ✅ NO JSON.parse()
      }),
      catchError(err => {
        console.error('[ChatService] sendMessage error:', err);
        return of(payload);
      })
    );
  }

  listConversations(): Observable<any[]> {
    return from(client.queries.customListConversations({})).pipe(
      map(result => {
        if (Array.isArray(result.errors) && result.errors.length > 0) {
          throw new Error(result.errors[0].message);
        }
        return result.data ?? []; // ✅ No parsing
      }),
      catchError(err => {
        console.error('[ChatService] listConversations error:', err);
        return of([]);
      })
    );
  }

  listMessagesByConversationId(conversationId: string): Observable<any[]> {
    return from(client.queries.customListMessagesByConversationId({ conversationId })).pipe(
      map(result => {
        if (Array.isArray(result.errors) && result.errors.length > 0) {
          throw new Error(result.errors[0].message);
        }
        return result.data ?? []; // ✅ No parsing
      }),
      catchError(err => {
        console.error('[ChatService] listMessages error:', err);
        return of([]);
      })
    );
  }

  subscribeToMessages(conversationId: string): Observable<any> {
    return new Observable(observer => {
      observer.next(null);
      observer.complete();
    });
  }
}