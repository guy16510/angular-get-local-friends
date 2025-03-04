import { Injectable } from '@angular/core';
// import { API, graphqlOperation } from 'aws-amplify';
import { Observable } from 'rxjs';

// GraphQL mutation for creating a new chat message.
const createMessageMutation = /* GraphQL */ `
  mutation CreateMessage($userId: String!, $text: String!) {
    createMessage(userId: $userId, text: $text) {
      id
      userId
      text
      timestamp
    }
  }
`;

// GraphQL subscription for receiving new chat messages.
const onCreateMessageSubscription = /* GraphQL */ `
  subscription OnCreateMessage {
    onCreateMessage {
      id
      userId
      text
      timestamp
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class ChatService {
  // Subscribe to new messages (uses websockets via AppSync)
  subscribeToMessages(): Observable<any> {
    // return true;
    return new Observable(observer => {
      // Simulate receiving a new message
      observer.next({ id: '1', userId: 'user1', text: 'Hello', timestamp: new Date().toISOString() });
      observer.complete();
    });
    // return API.graphql(graphqlOperation(onCreateMessageSubscription)) as Observable<any>;
  }

  // Send a new message using a GraphQL mutation.
  sendMessage(message: { userId: string; text: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      // Simulate sending a message
      resolve({ id: '2', userId: message.userId, text: message.text, timestamp: new Date().toISOString() });
    });
    // return API.graphql(graphqlOperation(createMessageMutation, message));
  }
}