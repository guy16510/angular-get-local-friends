// @ts-nocheck
import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { AppendMessage, LoadConversations, LoadMessages, SendMessage, UpdatePresenceStatus, UpdateTypingStatus } from '../actions/chat.actions';
import { appendPaginatedMessages, getNormalizedConversationId } from '../../utils/chat-utils';
import { tap } from 'rxjs/operators';
import { from, EMPTY, Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ChatStateModel, ChatMessage, Conversation } from '../../models/chat';

export interface ChatMessage {
  conversationId: string;
  senderId: string;
  recipientId: string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  conversationId: string;
  id: string;
  participantA: string;
  participantB: string;
  lastMessage: string;
  lastTimestamp: string;
}

export interface ChatStateModel {
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  loading: boolean;
  error: string | null;
  lastFetched: number | null; // timestamp in milliseconds
}


@State<ChatStateModel>({
  name: 'chat',
  defaults: {
    conversations: [],
    messages: {},
    typingStatus: {},
    presence: {},
    pagination: {},
    loading: false,
    error: null,
    lastFetched: null
  }
})
@Injectable()
export class ChatState {
  constructor(private chatService: ChatService, private store: Store) {}

  @Selector()
  static messages(state: ChatStateModel) {
    return state.messages;
  }

  @Selector()
  static getConversations(state: ChatStateModel) {
    return state.conversations;
  }
  
  @Selector()
  static getLoading(state: ChatStateModel) {
    return state.loading;
  }
  
  @Selector()
  static getError(state: ChatStateModel) {
    return state.error;
  }

  @Selector()
  static messagesForConversation(state: ChatStateModel) {
    return (conversationId: string) => state.messages[conversationId] || [];
  }

  @Selector()
  static nextTokenForConversation(state: ChatStateModel) {
    return (conversationId: string) => state.pagination[conversationId] || null;
  }

  @Action(LoadConversations)
  loadConversations(ctx: StateContext<ChatStateModel>) {
    ctx.patchState({ loading: true, error: null });
    return this.chatService.listConversations().pipe(
      tap(conversations => ctx.patchState({ conversations, loading: false, lastFetched: Date.now() })),
      catchError(err => {
        ctx.patchState({ loading: false, error: err?.message || 'Load failed' });
        return EMPTY;
      })
    );
  }

  @Action(LoadMessages)
  loadMessages(ctx: StateContext<ChatStateModel>, { conversationId, limit, nextToken }: LoadMessages) {
    return this.chatService.listMessagesByConversationId(conversationId, limit, nextToken).pipe(
      tap(({ items, nextToken }) => {
        const state = ctx.getState();
        const existing = state.messages[conversationId] || [];
        ctx.patchState({
          messages: {
            ...state.messages,
            [conversationId]: appendPaginatedMessages(existing, items)
          },
          pagination: {
            ...state.pagination,
            [conversationId]: nextToken
          }
        });
      })
    );
  }

  @Action(AppendMessage)
  appendMessage(ctx: StateContext<ChatStateModel>, { message }: AppendMessage) {
    const state = ctx.getState();
    const existing = state.messages[message.conversationId] || [];
    const isDuplicate = existing.some(m => m.id === message.id);
    if (!isDuplicate) {
      ctx.patchState({
        messages: {
          ...state.messages,
          [message.conversationId]: [...existing, message]
        }
      });
    }
  }

  @Action(SendMessage)
  sendMessage(ctx: StateContext<ChatStateModel>, { recipientId, text }: SendMessage) {
    return this.chatService.sendMessage(recipientId, text).pipe(
      tap(msg => this.store.dispatch(new AppendMessage(msg)))
    );
  }

  @Action(UpdateTypingStatus)
  updateTyping(ctx: StateContext<ChatStateModel>, { conversationId, userId, isTyping }: UpdateTypingStatus) {
    const state = ctx.getState();
    const typingUsers = new Set(state.typingStatus[conversationId] || []);
    isTyping ? typingUsers.add(userId) : typingUsers.delete(userId);
    ctx.patchState({
      typingStatus: { ...state.typingStatus, [conversationId]: Array.from(typingUsers) }
    });
  }

  @Action(UpdatePresenceStatus)
  updatePresence(ctx: StateContext<ChatStateModel>, { userId, status }: UpdatePresenceStatus) {
    const state = ctx.getState();
    ctx.patchState({
      presence: { ...state.presence, [userId]: status }
    });
  }
}

// @State<ChatStateModel>({
//   name: 'chat',
//   defaults: {
//     conversations: [],
//     messages: {},
//     loading: false,
//     error: null,
//     lastFetched: null
//   }
// })
// @Injectable()
// export class ChatState {
//   constructor(private chatService: ChatService, private store: Store) {}

//   @Selector()
//   static messages(state: ChatStateModel) {
//     return state.messages;
//   }

//   @Selector()
//   static getConversations(state: ChatStateModel) {
//     return state.conversations;
//   }
  
//   @Selector()
//   static getLoading(state: ChatStateModel) {
//     return state.loading;
//   }
  
//   @Selector()
//   static getError(state: ChatStateModel) {
//     return state.error;
//   }

//   @Selector()
//   static messagesForConversation(state: ChatStateModel) {
//     return (conversationId: string): ChatMessage[] => {
//       return state.messages?.[conversationId] || [];
//     };
//   }

//   @Action(LoadConversations)
//   loadConversations(ctx: StateContext<ChatStateModel>, action: LoadConversations) {
//     ctx.patchState({ loading: true, error: null });
//     return from(this.chatService.listConversations()).pipe(
//       switchMap((conversations$: Observable<Conversation[]>) => conversations$),
//       tap((conversations: Conversation[]) => {
//         const state = ctx.getState() as ChatStateModel;
//         ctx.patchState({
//           conversations,
//           loading: false,
//           error: null,
//           lastFetched: Date.now()
//         });
//       }),
//       catchError((err) => {
//         console.error('[ChatState] LoadConversations failed:', err);
//         ctx.patchState({
//           loading: false,
//           error: err?.message || 'Failed to load conversations'
//         });
//         return EMPTY;
//       })
//     );
//   }

//   @Action(LoadMessages)
//   loadMessages(ctx: StateContext<ChatStateModel>, action: LoadMessages) {
//     // Normalize the conversationId
//     const ids = action.conversationId.split('#');
//     const conversationId = getNormalizedConversationId(ids[0], ids[1]);
  
//     return this.chatService.listMessagesByConversationId(conversationId).pipe(
//       tap((msgs: ChatMessage[]) => {
//         const state = ctx.getState() as ChatStateModel;
//         ctx.patchState({
//           messages: {
//             ...state.messages,
//             [conversationId]: msgs || []
//           }
//         });
//       })
//     );
//   }

//   @Action(AppendMessage)
//   appendMessage(ctx: StateContext<ChatStateModel>, action: AppendMessage) {
//     const state = ctx.getState() as ChatStateModel;
//     const msg = action.message;
//     const conversationId = msg.conversationId;
//     const updated = [...(state.messages[conversationId] || []), msg];

//     ctx.patchState({
//       messages: {
//         ...state.messages,
//         [conversationId]: updated
//       }
//     });
//   }

//   @Action(SendMessage)
//   sendMessage(ctx: StateContext<ChatStateModel>, action: SendMessage) {
//     return this.chatService.sendMessage(action.recipientId, action.text).pipe(
//       tap((msg: ChatMessage) => {
//         if (!msg) {
//           console.error('Received undefined message');
//           return;
//         }
//         const state = ctx.getState() as ChatStateModel;
//         const conversationId = [msg.senderId, msg.recipientId].sort().join('#');
//         const updatedMsgs = [...(state.messages[conversationId] || []), msg];
//         ctx.patchState({
//           messages: {
//             ...state.messages,
//             [conversationId]: updatedMsgs
//           }
//         });
//       })
//     );
//   }
// }