import { State, Action, StateContext, Selector } from '@ngxs/store';
import {
  AddMessage,
  SetMessagesLoading,
  SetMessagesError,
  SetConversations,
  SetConversationsLoading,
  SetConversationsError,
} from '../actions/chat.actions';
import {  ChatMessage, Conversation} from '../../models/chat';

export interface ChatStateModel {
  messages: ChatMessage[];
  conversations: Conversation[];
  messagesLoading: boolean;
  messagesError: string | null;
  conversationsLoading: boolean;
  conversationsError: string | null;
}

@State<ChatStateModel>({
  name: 'chat',
  defaults: {
    messages: [],
    conversations: [],
    messagesLoading: false,
    messagesError: null,
    conversationsLoading: false,
    conversationsError: null,
  },
})
export class ChatState {
  // Selectors for messages and conversations
  @Selector()
  static getMessages(state: ChatStateModel): ChatMessage[] {
    return state.messages;
  }

  @Selector()
  static isMessagesLoading(state: ChatStateModel): boolean {
    return state.messagesLoading;
  }

  @Selector()
  static getMessagesError(state: ChatStateModel): string | null {
    return state.messagesError;
  }

  @Selector()
  static getConversations(state: ChatStateModel): Conversation[] {
    return state.conversations;
  }

  @Selector()
  static isConversationsLoading(state: ChatStateModel): boolean {
    return state.conversationsLoading;
  }

  @Selector()
  static getConversationsError(state: ChatStateModel): string | null {
    return state.conversationsError;
  }

  // Action to add a single message
  @Action(AddMessage)
  addMessage(ctx: StateContext<ChatStateModel>, action: AddMessage) {
    const state = ctx.getState();
    ctx.setState({ ...state, messages: [...state.messages, action.payload] });
  }

  // Action to set the entire messages list
  // @Action(SetMessages)
  // setMessages(ctx: StateContext<ChatStateModel>, action: SetMessages) {
  //   ctx.patchState({ messages: action.payload });
  // }

  // Set loading flag for messages
  @Action(SetMessagesLoading)
  setMessagesLoading(ctx: StateContext<ChatStateModel>, action: SetMessagesLoading) {
    ctx.patchState({ messagesLoading: action.payload });
  }

  // Set error state for messages
  @Action(SetMessagesError)
  setMessagesError(ctx: StateContext<ChatStateModel>, action: SetMessagesError) {
    ctx.patchState({ messagesError: action.payload });
  }

  // Set conversation summaries
  @Action(SetConversations)
  setConversations(ctx: StateContext<ChatStateModel>, action: SetConversations) {
    ctx.patchState({ conversations: action.payload });
  }

  // Set loading flag for conversations
  @Action(SetConversationsLoading)
  setConversationsLoading(ctx: StateContext<ChatStateModel>, action: SetConversationsLoading) {
    ctx.patchState({ conversationsLoading: action.payload });
  }

  // Set error state for conversations
  @Action(SetConversationsError)
  setConversationsError(ctx: StateContext<ChatStateModel>, action: SetConversationsError) {
    ctx.patchState({ conversationsError: action.payload });
  }
}