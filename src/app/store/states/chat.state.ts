import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { AppendMessage, LoadConversations, LoadMessages, SendMessage } from '../actions/chat.actions';
import { getNormalizedConversationId } from '../../utils/chat-utils';
import { tap } from 'rxjs/internal/operators/tap';

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
}

@State<ChatStateModel>({
  name: 'chat',
  defaults: {
    conversations: [],
    messages: {},
    loading: false,
    error: null
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
    return (conversationId: string): ChatMessage[] => {
      return state.messages?.[conversationId] || [];
    };
  }

  @Action(LoadConversations)
  async loadConversations(ctx: StateContext<ChatStateModel>, action: LoadConversations) {
    ctx.patchState({ loading: true, error: null });
  
    const obs = await this.chatService.listConversations();
    return obs.subscribe({
      next: (conversations: Conversation[]) => {
        ctx.patchState({
          conversations,
          loading: false,
          error: null
        });
      },
      error: (err: any) => {
        console.error('[ChatState] LoadConversations failed:', err);
        ctx.patchState({
          loading: false,
          error: err?.message || 'Failed to load conversations'
        });
      }
    });
  }

  @Action(LoadMessages)
  loadMessages(ctx: StateContext<ChatStateModel>, action: LoadMessages) {
    // Normalize the conversationId
    const ids = action.conversationId.split('#');
    const conversationId = getNormalizedConversationId(ids[0], ids[1]);
  
    return this.chatService.listMessagesByConversationId(conversationId).pipe(
      tap((msgs: ChatMessage[]) => {
        const state = ctx.getState();
        ctx.patchState({
          messages: {
            ...state.messages,
            [conversationId]: msgs || []
          }
        });
      })
    );
  }

  @Action(AppendMessage)
  appendMessage(ctx: StateContext<ChatStateModel>, action: AppendMessage) {
    const state = ctx.getState();
    const msg = action.message;
    const conversationId = msg.conversationId;
    const updated = [...(state.messages[conversationId] || []), msg];

    ctx.patchState({
      messages: {
        ...state.messages,
        [conversationId]: updated
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
        const state = ctx.getState();
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
}