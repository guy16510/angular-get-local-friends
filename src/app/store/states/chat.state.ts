import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { AppendMessage, LoadConversations, LoadMessages, MarkMessagesAsRead, ReactToMessage, SendMessage, SetTypingStatus, SetActiveConversation, IncrementUnreadCount, ResetUnreadCount, FetchUnreadMessages } from '../actions/chat.actions';
import { getNormalizedConversationId } from '../../utils/chat-utils';
import { tap } from 'rxjs/operators';
import { from, EMPTY, Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AuthState } from './auth.state';
import { ChatMessage, Conversation, ChatStateModel, MessageStatus } from '../../models/chat';

@State<ChatStateModel>({
  name: 'chat',
  defaults: {
    conversations: [],
    messages: {},
    loading: false,
    error: null,
    lastFetched: null,
    activeConversationId: null,
    unreadCount: 0,
    unreadMessages: []
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

  @Selector()
  static activeConversationId(state: ChatStateModel) {
    return state.activeConversationId;
  }

  @Selector()
  static unreadCount(state: ChatStateModel) {
    return state.unreadCount;
  }

  @Selector()
  static unreadMessages(state: ChatStateModel) {
    return state.unreadMessages;
  }

  @Selector()
  static unreadMessageCountForConversation(state: ChatStateModel) {
    return (conversationId: string): number => {
      const messages = state.messages?.[conversationId] || [];
      return messages.filter(msg => 
        msg.status === 'sent'
      ).length;
    };
  }

  @Selector()
  static isConversationUnread(state: ChatStateModel) {
    return (conversationId: string): boolean => {
      // Try to find by conversationId first, then by id
      const conversation = state.conversations.find(c => 
        (c.conversationId === conversationId) || (c.id === conversationId)
      );
      return (conversation?.unreadCount || 0) > 0;
    };
  }
  
  @Action(IncrementUnreadCount)
  incrementUnreadCount(ctx: StateContext<ChatStateModel>, action: IncrementUnreadCount) {
    const state = ctx.getState();
    ctx.patchState({ unreadCount: state.unreadCount + action.payload });
  }

  @Action(ResetUnreadCount)
  resetUnreadCount(ctx: StateContext<ChatStateModel>) {
    ctx.patchState({ unreadCount: 0 });
  }

  @Action(FetchUnreadMessages)
  fetchUnreadMessages(ctx: StateContext<ChatStateModel>) {
    ctx.patchState({ loading: true, error: null });
    
    return this.chatService.getUnreadMessages().pipe(
      tap((unreadMessages: ChatMessage[]) => {
        ctx.patchState({ 
          unreadMessages,
          unreadCount: unreadMessages.length,
          loading: false
        });
        
        // Update conversation unread counts
        if (unreadMessages.length > 0) {
          const state = ctx.getState();
          const currentUserId = this.store.selectSnapshot(AuthState.identityId);
          
          // Group unread messages by conversation
          const unreadByConversation = new Map<string, ChatMessage[]>();
          unreadMessages.forEach(msg => {
            const conversationId = getNormalizedConversationId(msg.senderId, msg.recipientId);
            const messages = unreadByConversation.get(conversationId) || [];
            messages.push(msg);
            unreadByConversation.set(conversationId, messages);
          });
          
          // Update conversation unread counts
          const updatedConversations = state.conversations.map(convo => {
            const conversationId = convo.conversationId || convo.id;
            const unreadMessages = unreadByConversation.get(conversationId) || [];
            
            return {
              ...convo,
              unreadCount: unreadMessages.length
            };
          });
          
          ctx.patchState({
            conversations: updatedConversations
          });
        }
      }),
      catchError(err => {
        console.error('[ChatState] FetchUnreadMessages failed:', err);
        ctx.patchState({
          loading: false,
          error: err?.message || 'Failed to fetch unread messages'
        });
        return EMPTY;
      })
    );
  }

  @Action(SetActiveConversation)
  setActiveConversation(ctx: StateContext<ChatStateModel>, { conversationId }: SetActiveConversation) {
    ctx.patchState({ activeConversationId: conversationId });
  }

  @Action(LoadConversations)
  loadConversations(ctx: StateContext<ChatStateModel>) {
    ctx.patchState({ loading: true, error: null });
    const currentUserId = this.store.selectSnapshot(AuthState.identityId);

    return this.chatService.listConversations().pipe(
      tap((conversations: Conversation[]) => {
        // Enhance conversations with unread counts and ensure conversationId is properly set
        const conversationsWithUnreadCounts = conversations.map(convo => {
          // Ensure each conversation has a proper conversationId field
          const conversationId = convo.conversationId || convo.id;
          const messages = ctx.getState().messages[conversationId] || [];
          
          // Count unread messages (status === 'sent' && recipientId === currentUserId)
          const unreadCount = messages.filter(
            msg => msg.status === 'sent' && msg.recipientId === currentUserId
          ).length;
          
          return {
            ...convo,
            conversationId, // Ensure conversationId is set
            unreadCount
          };
        });

        ctx.patchState({
          conversations: conversationsWithUnreadCounts,
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
    const state = ctx.getState();
    const msg = action.message;
    const normalizedId = getNormalizedConversationId(msg.senderId, msg.recipientId);
    const updated = [...(state.messages[normalizedId] || []), msg];

    // Update the messages
    ctx.patchState({
      messages: {
        ...state.messages,
        [normalizedId]: updated
      }
    });

    // If this is a message from another user to the current user and it's the active conversation,
    // we should also update the unread count of that conversation
    const currentUserId = this.store.selectSnapshot(AuthState.identityId);
    const activeConversationId = state.activeConversationId;

    // Update conversation's unread count if needed
    if (msg.senderId !== currentUserId && msg.recipientId === currentUserId) {
      const conversations = state.conversations.map(convo => {
        if (convo.conversationId === normalizedId) {
          // If the conversation is not active, increment unread count
          if (activeConversationId !== normalizedId) {
            return {
              ...convo,
              unreadCount: (convo.unreadCount || 0) + 1,
              lastMessage: msg.text || 'New message',
              lastTimestamp: msg.timestamp
            };
          }
          // Otherwise, leave unread count at 0 and update last message
          return {
            ...convo,
            lastMessage: msg.text || 'New message',
            lastTimestamp: msg.timestamp
          };
        }
        return convo;
      });

      ctx.patchState({
        conversations
      });
    }
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

        // Update the messages with read status
        ctx.patchState({
          messages: {
            ...state.messages,
            [conversationId]: merged
          }
        });

        // Update the unread count in the conversation
        const currentConversations = state.conversations;
        const updatedConversations = currentConversations.map(convo => {
          if (convo.conversationId === conversationId) {
            return {
              ...convo,
              unreadCount: 0 // Reset unread count for this conversation
            };
          }
          return convo;
        });

        ctx.patchState({
          conversations: updatedConversations
        });

        console.log(`[ChatState] Marked ${updatedMessages.length} messages as read and updated conversation`);
      }),
      catchError((err) => {
        console.error('[ChatState] Failed to mark messages as read', err);
        return EMPTY;
      })
    );
  }


}