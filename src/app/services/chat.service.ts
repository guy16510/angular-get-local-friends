import { Injectable } from '@angular/core';
import { from, Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { ChatMessage, Conversation } from '../models/chat';
import { Store } from '@ngxs/store';
import { AuthState } from '../store/states/auth.state';

const client = generateClient<Schema>();

@Injectable({ providedIn: 'root' })
export class ChatService {

  constructor(private store: Store) { }

  sendMessage(recipientId: string, text: string): Observable<ChatMessage> {
    return from(client.mutations.createMessage({ recipientId, text })).pipe(
      map((result: any) => {
        console.log('createMessage mutation result:', result);
        return result as ChatMessage;
      }),
      catchError(err => {
        console.error('[ChatService] sendMessage error:', err);
        return throwError(() => err);
      })
    );
  }

  listConversations(): Observable<Conversation[]> {
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
        return throwError(() => err);
      })
    );
  }

  async setTypingStatus(conversationId: string, userId: string, isTyping: boolean) {
    await client.mutations.setTypingStatus({ conversationId, userId, isTyping });
  }

  /**
   * While in Chat, this shows that the other user is typing.
   * @param conversationId 
   * @returns 
   */
  subscribeToTypingStatus(conversationId: string): Observable<{ conversationId: string; userId: string; isTyping: boolean }> {
    return new Observable(observer => {
      const subscription = (client.subscriptions as any)
        .onTypingStatus({ conversationId })
        .subscribe({
          next: (event: any) => {
            if (event) {
              observer.next(event);
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


  /**
   * Subscribes to all new messages and filters only those for the given conversationId.
   * Note: AppSync subscriptions often inherit authMode from schema — change only if you hit errors.
   */
  subscribeToMessagesForConversation(conversationId: string): Observable<ChatMessage> {
    return new Observable<ChatMessage>((observer) => {
      const subscription = client.subscriptions.onCreateMessage().subscribe({
        next: (event: any) => {
          const message = event;
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

  markMessagesAsRead(conversationId: string): Observable<any[]> {
    return from(client.mutations.markMessagesAsRead({ conversationId })).pipe(
      map((result: any) => result?.data ?? []),
      catchError(err => {
        console.error('[ChatService] markMessagesAsRead error:', err);
        return throwError(() => err);
      })
    );
  }


  /**
   * Not implmented yet.
   */
  reactToMessage(messageId: string, emoji: string): Observable<ChatMessage> {
    return from(client.mutations.reactToMessage({ messageId, emoji })).pipe(
      map((result: any) => result?.data ?? []),
      catchError(err => {
        console.error('[ChatService] reactToMessage error:', err);
        return throwError(() => new Error('Failed to react to message'));
      })
    );
  }


  /**
   * Query unread messages using the listUnreadMessages query.
   * This should return messages for which status === "sent".
   */
  getUnreadMessages(): Observable<ChatMessage[]> {
    const identityId = this.store.selectSnapshot(AuthState.identityId);
    if (!identityId) {
      return throwError(() => new Error('No identity available for query'));
    }
    return from(client.queries.listUnreadMessages({ recipientId: identityId })).pipe(
      map((result: any) => result?.data ?? []),
      catchError(err => {
        console.error('[ChatService] getUnreadMessages error:', err);
        return throwError(() => err);
      })
    );
  }

}


