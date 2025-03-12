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
  participantA: string;
  participantB: string;
  lastMessage: string;
  lastTimestamp: string;
}

export interface ChatStateModel {
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
}

@State<ChatStateModel>({
  name: 'chat',
  defaults: {
    conversations: [],
    messages: {}
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
  static conversations(state: ChatStateModel) {
    return state.conversations;
  }

  @Selector()
  static messagesForConversation(state: ChatStateModel) {
    return (conversationId: string): ChatMessage[] => {
      return state.messages?.[conversationId] || [];
    };
  }

  @Action(LoadConversations)
  loadConversations(ctx: StateContext<ChatStateModel>) {
    return this.chatService.listConversations().subscribe(convos => {
      ctx.patchState({ conversations: convos || [] });
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