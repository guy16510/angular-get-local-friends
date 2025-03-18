import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { LoadConversations, LoadMessages, SendMessage } from '../actions/chat.actions';

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
  loadConversations(ctx: StateContext<ChatStateModel>, action: LoadConversations) {
    ctx.patchState({ loading: true, error: null });
  
    return this.chatService.listConversations().subscribe({
      next: (conversations: Conversation[]) => {
        ctx.patchState({
          conversations,
          loading: false,
          error: null
        });
      },
      error: (err) => {
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
    return this.chatService.listMessagesByConversationId(action.conversationId).subscribe(msgs => {
      const state = ctx.getState();
      ctx.patchState({
        messages: {
          ...state.messages,
          [action.conversationId]: msgs || []
        }
      });
    });
  }

  @Action(SendMessage)
  sendMessage(ctx: StateContext<ChatStateModel>, action: SendMessage) {
    return this.chatService.sendMessage(action.recipientId, action.text).subscribe(msg => {
      const state = ctx.getState();
      const conversationId = [msg.senderId, msg.recipientId].sort().join('#');
      const updatedMsgs = [...(state.messages[conversationId] || []), msg];
      ctx.patchState({
        messages: {
          ...state.messages,
          [conversationId]: updatedMsgs
        }
      });
    });
  }
}