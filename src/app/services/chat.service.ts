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
  
  constructor(private store: Store) {}

  sendMessage(recipientId: string, text: string): Observable<ChatMessage> {
    const senderId = this.store.selectSnapshot(AuthState.identityId);
    if (!senderId) return throwError(() => new Error('Unauthorized'));

    const participants = [senderId, recipientId].sort();
    const conversationId = `${participants[0]}#${participants[1]}`;

    const timestamp = new Date().toISOString();

    return from(client.models.ChatMessage.create({
      conversationId,
      senderId,
      recipientId,
      text,
      timestamp,
    })).pipe(
      map((result: any) => {
        console.log('createMessage result:', result);
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

  subscribeToTypingStatus(conversationId: string): Observable<{ conversationId: string; userId: string; isTyping: boolean }> {
    return new Observable(observer => {
      const subscription = (client.subscriptions as any)
        .onTypingStatus({ conversationId })
        .subscribe({
          next: (event: any) => {
            if(event){
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

  subscribeToMessagesForConversation(conversationId: string): Observable<ChatMessage> {
    console.log('[Debug] Establishing ChatMessage subscription');
    return new Observable<ChatMessage>((observer) => {
      const subscription = client.models.ChatMessage.onCreate().subscribe({
        next: (message: any) => {
          console.log('[Debug] Received subscription event:', message);
          if (message.conversationId === conversationId) {
            observer.next(message);
          } else {
            console.log('[Debug] Ignored message for other conversation:', message.conversationId);
          }
        },
        error: (err: any) => {
          console.error('[Debug] Subscription ERROR:', err);
          observer.error(err);
        },
        complete: () => console.log('[Debug] Subscription completed')
      });

      return () => subscription.unsubscribe();
    });
  }

  // markMessagesAsRead(conversationId: string): Observable<{ updatedCount: number }> {
  //   return from(client.functions.markMessagesAsRead({ conversationId })).pipe(
  //     map(result => ({
  //       updatedCount: result?.updatedCount ?? 0
  //     })),
  //     catchError(err => {
  //       console.error('[ChatService] markMessagesAsRead error:', err);
  //       return throwError(() => new Error('Failed to mark messages as read'));
  //     })
  //   );
  // }
  
  markMessagesAsRead(conversationId: string): Observable<{ updatedCount: number }> {
    console.warn('[ChatService] mock markMessagesAsRead called for conversation:', conversationId);
    return of({ updatedCount: 0 }); // ✅ mock success result
  }
  
  // markMessagesAsRead(conversationId: string): Observable<{ updatedCount: number }> {
  //   const userId = this.store.selectSnapshot(AuthState.identityId);
  //   if (!userId) {
  //     return throwError(() => new Error('Unauthorized'));
  //   }
  
  //   return from(
  //     client.functions.markMessageAsRead({
  //       conversationId,
  //       userId,
  //       messageId: '' // 🧠 NOTE: schema requires messageId, you may need to adjust your backend to allow batch or ignore this param
  //     })
  //   ).pipe(
  //     map((result: any) => {
  //       console.warn('[ChatService] markMessageAsRead raw result:', result);
  //       return { updatedCount: 1 }; // mock value — backend should return a real count in future
  //     }),
  //     catchError(err => {
  //       console.error('[ChatService] markMessageAsRead error:', err);
  //       return throwError(() => new Error('Failed to mark messages as read'));
  //     })
  //   );
  // }

}