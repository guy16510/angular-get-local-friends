// import { Injectable } from '@angular/core';
// import { from, Observable, of, throwError } from 'rxjs';
// import { map, catchError } from 'rxjs/operators';
// import { generateClient } from 'aws-amplify/data';
// import type { Schema } from '../../../amplify/data/resource';
// import { ChatMessage, Conversation } from '../models/chat';

// const client = generateClient<Schema>();

// @Injectable({ providedIn: 'root' })
// export class ChatService {
//   sendMessage(recipientId: string, text: string): Observable<ChatMessage> {
//     return from(
//       client.mutations.createMessage({ recipientId, text })
//     ).pipe(
//       map((result: any) => {
//         console.log('createMessage result:', result);
//         // Ensure we return the chat message from the result
//         return result?.data as ChatMessage;
//       }),
//       catchError(err => {
//         console.error('[ChatService] sendMessage error:', err);
//         return throwError(() => err);
//       })
//     );
//   }

//   async listConversations(): Promise<Observable<Conversation[]>> {
//     return from(
//       client.queries.customListConversations({})
//     ).pipe(
//       map((res: any) => {
//         return res?.data || [];
//       }),
//       catchError(err => {
//         console.error('[ChatService] listConversations error:', err);
//         return throwError(() => new Error('List conversations failed'));
//       })
//     );
//   }

//   listMessagesByConversationId(conversationId: string): Observable<any[]> {
//     return from(
//       client.queries.customListMessagesByConversationId({ conversationId })
//     ).pipe(
//       map((result: any) => result?.data ?? []),
//       catchError(err => {
//         console.error('[ChatService] listMessages error:', err);
//         return of([]);
//       })
//     );
//   }

//   /**
//    * Subscribes to all new messages and filters only those for the given conversationId.
//    * Note: AppSync subscriptions often inherit authMode from schema — change only if you hit errors.
//    */
//   subscribeToMessagesForConversation(conversationId: string): Observable<ChatMessage> {
//     return new Observable<ChatMessage>((observer) => {
//       const subscription = client.subscriptions.onCreateMessage().subscribe({
//         next: (event: any) => {
//           const message = event?.data?.onCreateMessage;
//           if (message?.conversationId === conversationId) {
//             observer.next(message);
//           }
//         },
//         error: (err: any) => {
//           console.error('[ChatService] subscribeToMessages error:', err);
//           observer.error(err);
//         }
//       });

//       return () => subscription.unsubscribe();
//     });
//   }
  
// }

import { Injectable } from '@angular/core';
import { generateClient } from 'aws-amplify/data';
import { Conversation, ChatMessage } from '../models/chat';
import { Schema } from '../../../amplify/data/resource';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private client = generateClient<Schema>({
    authMode: 'userPool',
  });

  async getConversations(limit: number): Promise<Conversation[]> {
    const res = await this.client.queries.customListConversations({ limit });
    return (res.data as Conversation[]) || [];
  }
  // async getConversations(limit: number): Promise<Conversation[]> {
  //   const res = await this.client.queries.customListConversations({ limit });
  //   // No need to access 'data' since the Lambda returns the array directly
  //   return res as Conversation[] || [];
  // }
  
  async getMessages(conversationId: string, limit: number): Promise<ChatMessage[]> {
    const res = await this.client.queries.customListMessagesByConversationId({ conversationId, limit });
    return (res.data as ChatMessage[]) || [];
  }
  
  async sendMessage(conversationId: string, content: string): Promise<ChatMessage> {
    const res = await this.client.mutations.createMessage({ recipientId: conversationId, text: content });
    const msg = res.data as ChatMessage;
    return {
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      recipientId: msg.recipientId,
      timestamp: msg.timestamp,
      text: msg.text ?? undefined,
      type: msg.type ?? undefined,
      mediaUrl: msg.mediaUrl ?? undefined,
      status: msg.status ?? undefined,
      createdAt: msg.createdAt ?? undefined,
      updatedAt: msg.updatedAt ?? undefined,
    };
  }
  
  async markMessageAsRead(messageId: string, conversationId: string, userId: string) {
    await this.client.mutations.markMessageAsRead({ messageId, conversationId, userId });
  }
  
  async setTypingStatus(conversationId: string, userId: string, isTyping: boolean) {
    await this.client.mutations.setTypingStatus({ conversationId, userId, isTyping });
  }
  
  async setUserPresence(userId: string, status: string) {
    await this.client.mutations.setUserPresence({ userId, status });
  }

  async acknowledgeMessage(messageId: string) {
    await this.client.mutations.acknowledgeMessage({ messageId });
  }
  
subscribeToMessagesForConversation(conversationId: string, callback: (message: ChatMessage) => void) {
  return this.client.subscriptions.onCreateMessage().subscribe(message => {
    if (message.conversationId === conversationId) {
      callback({
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        recipientId: message.recipientId,
        timestamp: message.timestamp,
        text: message.text ?? undefined,
        type: message.type ?? undefined,
        mediaUrl: message.mediaUrl ?? undefined,
        status: message.status ?? undefined,
        createdAt: message.createdAt ?? undefined,
        updatedAt: message.updatedAt ?? undefined,
      });
    }
  });
}
}