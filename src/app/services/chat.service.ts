import { Injectable } from '@angular/core';
import { from, Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { ChatMessage, Conversation } from '../models/chat';

const client = generateClient<Schema>();

@Injectable({ providedIn: 'root' })
export class ChatService {
  sendMessage(recipientId: string, text: string): Observable<ChatMessage> {
    return from(client.mutations.createMessage({ recipientId, text })).pipe(
      map((result: any) => {
        console.log('createMessage result:', result);
        return result?.data as ChatMessage;
      }),
      catchError(err => {
        console.error('[ChatService] sendMessage error:', err);
        return throwError(() => err);
      })
    );
  }

  async listConversations(): Promise<Observable<Conversation[]>> {
    return from(client.queries.customListConversations({})).pipe(
      map((res: any) => res?.data || []),
      catchError(err => {
        console.error('[ChatService] listConversations error:', err);
        return throwError(() => new Error('List conversations failed'));
      })
    );
  }

  listMessagesByConversationId(conversationId: string): Observable<any[]> {
    return from(client.queries.customListMessagesByConversationId({ conversationId })).pipe(
      map((result: any) => result?.data ?? []),
      catchError(err => {
        console.error('[ChatService] listMessages error:', err);
        return of([]);
      })
    );
  }

  async setTypingStatus(conversationId: string, userId: string, isTyping: boolean) {
    await client.mutations.setTypingStatus({ conversationId, userId, isTyping });
  }
  
  subscribeToTypingStatus(conversationId: string): Observable<{ conversationId: string; userId: string; isTyping: boolean }> {
    return new Observable(observer => {
      // Cast to any so you can pass the conversationId as an argument.
      const subscription = (client.subscriptions as any)
        .onTypingStatus({ conversationId }) // this should add the variable to the subscription query
        .subscribe({
          next: (event: any) => {
            const status = event?.data?.onTypingStatus;
            if (status && status.conversationId === conversationId) {
              observer.next(status);
            }
          },
          error: (err: any) => {
            console.error('[ChatService] subscribeToTypingStatus error:', err);
            observer.error(err);
          }
        });
      return () => subscription.unsubscribe();
    });
  }

  subscribeToMessagesForConversation(conversationId: string): Observable<ChatMessage> {
    return new Observable<ChatMessage>((observer) => {
      const subscription = client.subscriptions.onCreateMessage().subscribe({
        next: (event: any) => {
          console.log('onCreateMessage raw event:', event);
          const message = event?.data?.onCreateMessage;
          // Remove filter temporarily for testing
          observer.next(message);
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