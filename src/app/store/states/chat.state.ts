import { State, Action, StateContext, Selector } from '@ngxs/store';
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
  messages: Record<string, ChatMessage[]>; // conversationId → array of messages
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
  constructor(private chatService: ChatService) {}

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
    return (conversationId: string) => state.messages[conversationId] || [];
  }

  @Action(LoadConversations)
  loadConversations(ctx: StateContext<ChatStateModel>, action: LoadConversations) {
    return this.chatService.listConversations(action.userId).subscribe(convos => {
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
    return this.chatService.sendMessage(action.senderId, action.recipientId, action.text).subscribe(msg => {
      const state = ctx.getState();
      const conversationId = [action.senderId, action.recipientId].sort().join('#');
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