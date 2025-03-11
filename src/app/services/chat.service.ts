import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

@Injectable({ providedIn: 'root' })
export class ChatService {
  sendMessage(senderId: string, recipientId: string, text: string): Observable<any> {
    const payload = { senderId, recipientId, text };
    return from(client.mutations.createMessage(payload)).pipe(
      map(result => {
        if (Array.isArray(result.errors) && result.errors.length > 0) throw new Error(result.errors[0].message);
        return result.data ? JSON.parse(result.data as string) : payload;
      }),
      catchError(err => {
        console.error('sendMessage error', err);
        return of(payload);
      })
    );
  }

  listConversations(userId: string): Observable<any[]> {
    return from(client.queries.customListConversations({ userId })).pipe(
      map(result => {
        if (Array.isArray(result.errors) && result.errors.length > 0) throw new Error(result.errors[0].message);
        return result.data ? JSON.parse(result.data as string) : [];
      }),
      catchError(err => {
        console.error('listConversations error', err);
        return of([]);
      })
    );
  }

  listMessagesByConversationId(conversationId: string): Observable<any[]> {
    return from(client.queries.customListMessagesByConversationId({ conversationId })).pipe(
      map(result => {
        if (Array.isArray(result.errors) && result.errors.length > 0) throw new Error(result.errors[0].message);
        return result.data ? JSON.parse(result.data as string) : [];
      }),
      catchError(err => {
        console.error('listMessages error', err);
        return of([]);
      })
    );
  }

  subscribeToMessages(conversationId: string): Observable<any> {
    return new Observable(observer => {
      observer.next(null);
      observer.complete();
    });
  }
}