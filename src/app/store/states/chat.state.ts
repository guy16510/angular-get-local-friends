import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { ChatService } from '../../services/chat.service';
import { Conversation, ChatMessage } from '../../models/chat';
import {
  LoadConversations, LoadMessages, AddMessage,
  AcknowledgeMessage, MarkMessageAsRead, SetTypingStatus
} from '../actions/chat.actions';
import { patch, append } from '@ngxs/store/operators';
import { AuthState } from './auth.state';

export interface ChatStateModel {
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  loading: boolean;
  error?: string | null;
  lastFetched?: number | null; // optional, if you're tracking lastFetched timestamps
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
  constructor(private chatService: ChatService, private store: Store) {}

  @Selector()
static getConversations(state: ChatStateModel): Conversation[] {
  return state.conversations;
}

  @Selector()
  static getLoading(state: ChatStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static getError(state: ChatStateModel): string | null {
    return state.error || null;
  }

  @Selector()
  static messagesForConversation(state: ChatStateModel) {
    return (conversationId: string) => state.messages[conversationId] || [];
  }

  @Selector()
  static conversations(state: ChatStateModel): Conversation[] {
    return state.conversations;
  }

  @Selector()
  static messages(state: ChatStateModel): Record<string, ChatMessage[]> {
    return state.messages;
  }

  @Action(LoadConversations)
  async loadConversations(ctx: StateContext<ChatStateModel>, action: LoadConversations) {
    ctx.patchState({ loading: true });
    const conversations = await this.chatService.getConversations(action.limit);
    ctx.patchState({ conversations, loading: false });
  }

  @Action(LoadMessages)
  async loadMessages(ctx: StateContext<ChatStateModel>, { conversationId, limit }: LoadMessages) {
    const messages = await this.chatService.getMessages(conversationId, limit);
    ctx.setState(patch({
      messages: patch({ [conversationId]: messages })
    }));
  }

  @Action(AddMessage)
  async addMessage(ctx: StateContext<ChatStateModel>, { conversationId, message }: AddMessage) {
    const sentMessage = await this.chatService.sendMessage(conversationId, message.text!);
    ctx.setState(patch({
      messages: patch({ [conversationId]: append([sentMessage]) })
    }));
  }

  @Action(AcknowledgeMessage)
  async acknowledgeMessage(_: any, { messageId }: AcknowledgeMessage) {
    await this.chatService.acknowledgeMessage(messageId);
  }

  @Action(MarkMessageAsRead)
  async markMessageAsRead(_: any, { messageId, conversationId, userId }: MarkMessageAsRead) {
    await this.chatService.markMessageAsRead(messageId, conversationId, userId);
  }

  @Action(SetTypingStatus)
  async setTypingStatus(_: any, { conversationId, isTyping }: SetTypingStatus) {
    const userId = this.store.selectSnapshot(AuthState.identityId);
    if(userId){
      await this.chatService.setTypingStatus(conversationId, userId, isTyping);
    }
  }
}