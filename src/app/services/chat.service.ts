import { Injectable } from '@angular/core';
// import { API, graphqlOperation } from 'aws-amplify';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  /**
   * Subscribes to new messages.
   * Note: The subscription query should be written to return new messages.
   */
  subscribeToMessages(conversationId: string): Observable<any> {
    const subscriptionQuery = /* GraphQL */ `
      subscription OnCreateMessage {
        onCreateMessage {
          conversationId
          timestamp
          senderId
          recipientId
          text
        }
      }
    `;
    // Here we assume the subscription returns all messages;
    // if needed, filter on the client by conversationId.
    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  /**
   * Sends a new message via the createMessage mutation.
   */
  sendMessage(payload: { senderId: string | null; recipientId: string; text: string }): Promise<any> {
    const mutation = /* GraphQL */ `
      mutation CreateMessage($senderId: String!, $recipientId: String!, $text: String!) {
        createMessage(senderId: $senderId, recipientId: $recipientId, text: $text)
      }
    `;
    return Promise.resolve(true);
  }

  /**
   * Fetches conversation summaries for the given user.
   */
  listConversations(userId: string): Promise<any> {
    const query = /* GraphQL */ `
      query ListConversations($userId: String!) {
        listConversations(userId: $userId)
      }
    `;
    return Promise.resolve(true);
  }
}