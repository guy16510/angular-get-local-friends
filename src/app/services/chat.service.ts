import { Injectable } from '@angular/core';
import { from, Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { ChatMessage, Conversation } from '../models/chat';

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

  listConversations(): Observable<Conversation[]> {
    return from(client.queries.customListConversations({})).pipe(
      map((res: any) => {
        return res?.data || []
      }),
      catchError((err) => {
        console.error('[ChatService] listConversations error:', err);
        return throwError(() => new Error('List conversations failed'));
      })
    );
  }

  listMessagesByConversationId(conversationId: string): Observable<any[]> {
    return from(client.queries.customListMessagesByConversationId({ conversationId })).pipe(
      map(result => {
        if (Array.isArray(result.errors) && result.errors.length > 0) {
          throw new Error(result.errors[0].message);
        }
        return result?.data ?? [];
      }),
      catchError(err => {
        console.error('[ChatService] listMessages error:', err);
        return of([]);
      })
    );
  }


  /**
   * Subscribes to all new messages and filters only those for the given conversationId.
   */
  subscribeToMessagesForConversation(conversationId: string): Observable<ChatMessage> {
    return new Observable<ChatMessage>((observer) => {
      const subscription = client.subscriptions.onCreateMessage().subscribe({
        next: (event) => {
          const message = event;
          debugger;
          if (!message) return;

          if (message.conversationId === conversationId) {
            observer.next(message);
          }
        },
        error: (err) => {
          console.error('[ChatService] subscribeToMessages error:', err);
          observer.error(err);
        }
      });

      // Cleanup
      return () => subscription.unsubscribe();
    });
  }
}