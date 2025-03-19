import { Injectable } from '@angular/core';
import { from, Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { ChatMessage, Conversation } from '../models/chat';

const client = generateClient<Schema>({ authMode: 'AWS_IAM' as any });

@Injectable({ providedIn: 'root' })
export class ChatService {
  async sendMessage(recipientId: string, text: string): Promise<Observable<any>> {
    return from(
      client.mutations.createMessage({ recipientId, text })
    ).pipe(
      map((result: any) => result?.data?.createMessage),
      catchError(err => {
        console.error('[ChatService] sendMessage error:', err);
        return of({ recipientId, text });
      })
    );
  }

  async listConversations(): Promise<Observable<Conversation[]>> {
    return from(
      client.queries.customListConversations({})
    ).pipe(
      map((res: any) => res?.data?.customListConversations || []),
      catchError(err => {
        console.error('[ChatService] listConversations error:', err);
        return throwError(() => new Error('List conversations failed'));
      })
    );
  }

  async listMessagesByConversationId(conversationId: string): Promise<Observable<any[]>> {
    return from(
      client.queries.customListMessagesByConversationId({ conversationId })
    ).pipe(
      map((result: any) => result?.data?.customListMessagesByConversationId ?? []),
      catchError(err => {
        console.error('[ChatService] listMessages error:', err);
        return of([]);
      })
    );
  }

  /**
   * Subscribes to all new messages and filters only those for the given conversationId.
   * Note: AppSync subscriptions often inherit authMode from schema — change only if you hit errors.
   */
  subscribeToMessagesForConversation(conversationId: string): Observable<ChatMessage> {
    return new Observable<ChatMessage>((observer) => {
      const subscription = client.subscriptions.onCreateMessage().subscribe({
        next: (event: any) => {
          const message = event?.data?.onCreateMessage;
          if (message?.conversationId === conversationId) {
            observer.next(message);
          }
        },
        error: (err: any) => {
          console.error('[ChatService] subscribeToMessages error:', err);
          observer.error(err);
        }
      });

      return () => subscription.unsubscribe();
    });
  }
}