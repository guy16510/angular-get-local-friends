import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { FetchUnreadMessages, LoadConversations } from '../../store/actions/chat.actions';
import { ChatState } from '../../store/states/chat.state';
import { Conversation, ChatStateModel } from '../../models/chat';
import { MaterialModule } from '../../shared/material.module';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { AuthState } from '../../store/states/auth.state';
import { LoadingComponent } from '../shared/loading/loading.component';
import { getNormalizedConversationId } from '../../utils/chat-utils';
import { UserProfileState } from '../../store/states/user-profile.state';
import { LoadUserProfile } from '../../store/actions/user-profile.actions';
import { ImageDisplayComponent } from '../image-display/image-display.component';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
  standalone: true,
  imports: [MaterialModule, CommonModule, LoadingComponent, ImageDisplayComponent]
})
export class ChatListComponent implements OnInit {
  conversations$: Observable<Conversation[]> = this.store.select(ChatState.getConversations);
  loading$: Observable<boolean> = this.store.select(ChatState.getLoading);
  error$: Observable<string | null> = this.store.select(ChatState.getError);
  currentUserId: string | null = null;

  constructor(private store: Store, private router: Router, private chatService: ChatService) {}

  ngOnInit(): void {
    // Get the current user ID from Auth state.
    this.currentUserId = this.store.selectSnapshot(AuthState.identityId);
    
    // Subscribe to conversations and dispatch load actions for all unique recipient user IDs.
    this.conversations$.subscribe(conversations => {
      if (this.currentUserId && conversations && conversations.length) {
        const uniqueRecipientIds = new Set<string>();
        conversations.forEach(convo => {
          const recipientId = this.getRecipientId(convo);
          if (recipientId) {
            uniqueRecipientIds.add(recipientId);
          }
        });
        uniqueRecipientIds.forEach(recipientId => {
          this.store.dispatch(new LoadUserProfile(recipientId));
        });
      }
    });

    if (this.currentUserId) {
      const state = this.store.selectSnapshot((s: { chat: ChatStateModel }) => s.chat);
      const lastFetched = state.lastFetched;
      const now = Date.now();
      const threshold = 300000; // 5 minutes in milliseconds
      if (!lastFetched || (now - lastFetched) > threshold) {
        this.store.dispatch(new LoadConversations(this.currentUserId));
      } else {
        console.log('Using cached conversations.');
      }
      
      // Fetch unread messages to update the badges
      this.store.dispatch(new FetchUnreadMessages());
    }
  }

  refreshConversations(): void {
    if (this.currentUserId) {
      console.log('Refreshing conversations...');
      this.store.dispatch(new LoadConversations(this.currentUserId));
      this.store.dispatch(new FetchUnreadMessages());
    }
  }

  openConversation(convo: Conversation): void {
    const recipientId = this.getRecipientId(convo);
    const conversationId = getNormalizedConversationId(this.currentUserId!, recipientId);
    this.router.navigate(['/chat', conversationId, recipientId]);
  }

  getRecipientId(convo: Conversation): string {
    if (!this.currentUserId) return '';
    // Get conversation ID in the proper format
    const id = convo.conversationId || convo.id;
    // Determine the recipient by comparing participantA to the current user's ID.
    return convo.participantA === this.currentUserId ? convo.participantB : convo.participantA;
  }

  getRecipientName(convo: Conversation): string {
    const recipientId = this.getRecipientId(convo);
    // Lookup the recipient's username from the NGXS state.
    return this.store.selectSnapshot(UserProfileState.getUserNameById)?.(recipientId) || recipientId;
  }

  getConversationId(convo: Conversation): string {
    // Return either conversationId or id, defaulting to empty string if both are undefined
    return convo.conversationId || convo.id || '';
  }

  hasUnreadMessages(conversationId: string): boolean {
    // Use the selector from ChatState
    const isUnreadSelector = this.store.selectSnapshot(ChatState.isConversationUnread);
    return isUnreadSelector(conversationId || '');
  }
}