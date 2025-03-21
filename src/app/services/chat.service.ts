// @ts-nocheck
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
    return from(
      client.mutations.createMessage({ recipientId, text })
    ).pipe(
      map((result: any) => {
        console.log('createMessage result:', result);
        // Ensure we return the chat message from the result
        return result?.data as ChatMessage;
      }),
      catchError(err => {
        console.error('[ChatService] sendMessage error:', err);
        return throwError(() => err);
      })
    );
  }

  async listConversations(): Promise<Observable<Conversation[]>> {
    return from(
      client.queries.customListConversations({})
    ).pipe(
      map((res: any) => {
        return res?.data || [];
      }),
      catchError(err => {
        console.error('[ChatService] listConversations error:', err);
        return throwError(() => new Error('List conversations failed'));
      })
    );
  }

  listMessagesByConversationId(conversationId: string): Observable<any[]> {
    return from(
      client.queries.customListMessagesByConversationId({ conversationId })
    ).pipe(
      map((result: any) => result?.data ?? []),
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

  setTypingStatus(conversationId: string, isTyping: boolean): Observable<any> {
    return from(
      client.mutations.setTypingStatus({ conversationId, isTyping })
    ).pipe(catchError(err => throwError(() => err)));
  }
  
  subscribeToTypingStatus(conversationId: string): Observable<any> {
    return new Observable((observer) => {
      const subscription = client.subscriptions.onUpdateTypingStatus().subscribe({
        next: (event) => {
          const typingStatus = event?.data?.onUpdateTypingStatus;
          if (typingStatus?.conversationId === conversationId) {
            observer.next(typingStatus);
          }
        },
        error: (err) => observer.error(err)
      });
      return () => subscription.unsubscribe();
    });
  }
  
  setUserPresence(status: 'online' | 'away' | 'offline'): Observable<any> {
    return from(client.mutations.setUserPresence({ status }));
  }
  
  subscribeToPresenceChanges(): Observable<any> {
    return new Observable(observer => {
      const subscription = client.subscriptions.onUpdateUserPresence().subscribe({
        next: (event) => observer.next(event?.data?.onUpdateUserPresence),
        error: (err) => observer.error(err)
      });
      return () => subscription.unsubscribe();
    });
  }

}

/**
 * @Injectable({ providedIn: 'root' })
export class ChatService {
  sendMessage(recipientId: string, text: string): Observable<ChatMessage> {
    return from(client.mutations.createMessage({ recipientId, text })).pipe(
      map(res => res?.data as ChatMessage),
      catchError(err => throwError(() => err))
    );
  }

  listConversations(): Observable<Conversation[]> {
    return from(client.queries.customListConversations({})).pipe(
      map(res => res?.data || []),
      catchError(err => {
        console.error('[ChatService] listConversations failed', err);
        return throwError(() => err);
      })
    );
  }

  listMessagesByConversationId(conversationId: string, limit = 20, nextToken?: string): Observable<{ items: ChatMessage[]; nextToken: string | null }> {
    return from(client.queries.customListMessagesByConversationId({ conversationId, limit, nextToken })).pipe(
      map((res: any) => res?.data || { items: [], nextToken: null }),
      catchError(err => {
        console.error('[ChatService] listMessages error:', err);
        return of({ items: [], nextToken: null });
      })
    );
  }

  subscribeToMessagesForConversation(conversationId: string): Observable<ChatMessage> {
    return new Observable(observer => {
      const sub = client.subscriptions.onCreateMessage().subscribe({
        next: (event) => {
          const msg = event?.data?.onCreateMessage;
          if (msg?.conversationId === conversationId) observer.next(msg);
        },
        error: (err) => observer.error(err)
      });
      return () => sub.unsubscribe();
    });
  }

  setTypingStatus(conversationId: string, isTyping: boolean): Observable<any> {
    return from(client.mutations.setTypingStatus({ conversationId, isTyping }));
  }

  setUserPresence(status: 'online' | 'away' | 'offline'): Observable<any> {
    return from(client.mutations.setUserPresence({ status }));
  }
}
 */