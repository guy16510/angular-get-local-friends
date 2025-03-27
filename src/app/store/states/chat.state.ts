import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { AppendMessage, LoadConversations, LoadMessages, MarkMessagesAsRead, ReactToMessage, SendMessage, SetTypingStatus } from '../actions/chat.actions';
import { getNormalizedConversationId } from '../../utils/chat-utils';
import { tap } from 'rxjs/operators';
import { from, EMPTY, Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AuthState } from './auth.state';

type MessageStatus = 'sent' | 'delivered' | 'read';


export interface ChatMessage {
  conversationId: string;
  senderId: string;
  recipientId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read'; // new
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
  lastFetched: number | null;
}

@State<ChatStateModel>({
  name: 'chat',
  defaults: {
    conversations: [],
    messages: {},
    loading: false,
    error: null,
    lastFetched: null
  }
})
@Injectable()
export class ChatState {
  constructor(private chatService: ChatService, private store: Store) { }

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
    return (conversationId: string): ChatMessage[] => {
      return state.messages?.[conversationId] || [];
    };
  }

  @Action(LoadConversations)
  @Action(LoadConversations)
  loadConversations(ctx: StateContext<ChatStateModel>, action: LoadConversations) {
    ctx.patchState({ loading: true, error: null });

    return this.chatService.listConversations().pipe(
      tap((conversations: Conversation[]) => {
        ctx.patchState({
          conversations,
          loading: false,
          error: null,
          lastFetched: Date.now()
        });
      }),
      catchError((err) => {
        console.error('[ChatState] LoadConversations failed:', err);
        ctx.patchState({
          loading: false,
          error: err?.message || 'Failed to load conversations'
        });
        return EMPTY;
      })
    );
  }


  @Action(LoadMessages)
  loadMessages(ctx: StateContext<ChatStateModel>, action: LoadMessages) {
    ctx.patchState({ loading: true, error: null });

    const ids = action.conversationId.split('#');
    const conversationId = getNormalizedConversationId(ids[0], ids[1]);

    return this.chatService.listMessagesByConversationId(conversationId).pipe(
      tap((msgs: ChatMessage[]) => {
        const state = ctx.getState();
        ctx.patchState({
          messages: {
            ...state.messages,
            [conversationId]: msgs || []
          },
          loading: false
        });
      }),
      catchError((err) => {
        ctx.patchState({ loading: false, error: err?.message || 'Failed to load messages' });
        return EMPTY;
      })
    );
  }


  @Action(AppendMessage)
  appendMessage(ctx: StateContext<ChatStateModel>, action: AppendMessage) {
    const state = ctx.getState() as ChatStateModel;
    const msg = action.message;
    const normalizedId = getNormalizedConversationId(msg.senderId, msg.recipientId);
    const updated = [...(state.messages[normalizedId] || []), msg];

    ctx.patchState({
      messages: {
        ...state.messages,
        [normalizedId]: updated
      }
    });
  }

  @Action(SendMessage)
  sendMessage(ctx: StateContext<ChatStateModel>, action: SendMessage) {
    return this.chatService.sendMessage(action.recipientId, action.text).pipe(
      tap((msg: ChatMessage) => {
        if (!msg) {
          console.error('Received undefined message');
          return;
        }
        const state = ctx.getState() as ChatStateModel;
        const conversationId = [msg.senderId, msg.recipientId].sort().join('#');
        const updatedMsgs = [...(state.messages[conversationId] || []), msg];
        ctx.patchState({
          messages: {
            ...state.messages,
            [conversationId]: updatedMsgs
          }
        });
      })
    );
  }

  @Action(SetTypingStatus)
  async setTypingStatus(_: any, { conversationId, isTyping }: SetTypingStatus) {
    const userId = this.store.selectSnapshot(AuthState.identityId);
    if (userId) {
      await this.chatService.setTypingStatus(conversationId, userId, isTyping);
    }
  }

  @Action(ReactToMessage)
  reactToMessage(ctx: StateContext<ChatStateModel>, { messageId, emoji }: ReactToMessage) {
    return this.chatService.reactToMessage(messageId, emoji).pipe(
      tap((updatedMessage: ChatMessage) => {
        const state = ctx.getState();
        const conversationId = updatedMessage.conversationId;
        const updatedMessages = (state.messages[conversationId] || []).map(msg =>
          msg.timestamp === updatedMessage.timestamp ? updatedMessage : msg
        );
        ctx.patchState({
          messages: {
            ...state.messages,
            [conversationId]: updatedMessages
          }
        });
      }),
      catchError((err) => {
        console.error('[ChatState] Failed to react to message', err);
        return EMPTY;
      })
    );
  }

  @Action(MarkMessagesAsRead)
  markMessagesAsRead(ctx: StateContext<ChatStateModel>, { conversationId }: MarkMessagesAsRead) {
    return this.chatService.markMessagesAsRead(conversationId).pipe(
      tap((updatedMessages: ChatMessage[]) => {
        if (!updatedMessages?.length) {
          console.warn('[ChatState] No messages updated as read.');
          return;
        }

        const state = ctx.getState();
        const existingMessages = state.messages[conversationId] || [];

        const merged = existingMessages.map(msg => {
          const updated = updatedMessages.find(m => m.timestamp === msg.timestamp);
          return updated
            ? { ...msg, status: 'read' as MessageStatus }
            : msg;
        });

        ctx.patchState({
          messages: {
            ...state.messages,
            [conversationId]: merged
          }
        });

        console.log(`[ChatState] Marked ${updatedMessages.length} messages as read`);
      }),
      catchError((err) => {
        console.error('[ChatState] Failed to mark messages as read', err);
        return EMPTY;
      })
    );
  }

}