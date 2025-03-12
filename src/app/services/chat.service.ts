import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>({
  authMode: 'userPool'  // ⬅️ Critical to ensure identity context is attached
});

@Injectable({ providedIn: 'root' })
export class ChatService {
  /**
   * Sends a chat message from the currently authenticated user.
   */
  sendMessage(recipientId: string, text: string): Observable<any> {
    const payload = { recipientId, text };

    return from(client.mutations.createMessage(payload)).pipe(
      map(result => {
        if (Array.isArray(result.errors) && result.errors.length > 0) {
          throw new Error(result.errors[0].message);
        }

        return result.data ? JSON.parse(result.data as string) : payload;
      }),
      catchError(err => {
        console.error('[ChatService] sendMessage error:', err);
        return of(payload);  // Fallback: return payload so UI doesn't crash
      })
    );
  }

  /**
   * Fetches all conversations for the currently authenticated user.
   */
  listConversations(): Observable<any[]> {
    return from(client.queries.customListConversations({})).pipe(
      map(result => {
        if (Array.isArray(result.errors) && result.errors.length > 0) {
          throw new Error(result.errors[0].message);
        }

        return result.data ? JSON.parse(result.data as string) : [];
      }),
      catchError(err => {
        console.error('[ChatService] listConversations error:', err);
        return of([]);
      })
    );
  }

  /**
   * Fetches all messages in a specific conversation.
   */
  listMessagesByConversationId(conversationId: string): Observable<any[]> {
    return from(client.queries.customListMessagesByConversationId({ conversationId })).pipe(
      map(result => {
        if (Array.isArray(result.errors) && result.errors.length > 0) {
          throw new Error(result.errors[0].message);
        }

        return result.data ? JSON.parse(result.data as string) : [];
      }),
      catchError(err => {
        console.error('[ChatService] listMessages error:', err);
        return of([]);
      })
    );
  }

  /**
   * Subscribe to real-time updates for a conversation (placeholder).
   */
  subscribeToMessages(conversationId: string): Observable<any> {
    // TODO: implement real-time subscription if using GraphQL Subscriptions
    return new Observable(observer => {
      observer.next(null);
      observer.complete();
    });
  }
}