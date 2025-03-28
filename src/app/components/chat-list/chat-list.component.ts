import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { LoadConversations } from '../../store/actions/chat.actions';
import { ChatState, ChatStateModel } from '../../store/states/chat.state';
import { Conversation } from '../../models/chat';
import { MaterialModule } from '../../shared/material.module';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { AuthState } from '../../store/states/auth.state';
import { LoadingComponent } from '../shared/loading/loading.component';
import { getNormalizedConversationId } from '../../utils/chat-utils';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
  standalone: true,
  imports: [MaterialModule, CommonModule, LoadingComponent]
})
export class ChatListComponent implements OnInit {
  conversations$: Observable<Conversation[]> = this.store.select(ChatState.getConversations);
  loading$: Observable<boolean> = this.store.select(ChatState.getLoading);
  error$: Observable<string | null> = this.store.select(ChatState.getError);
  currentUserId: string | null = null;

  constructor(private store: Store, private router: Router, private chatService: ChatService) {}

  ngOnInit(): void {
    this.currentUserId = this.store.selectSnapshot(AuthState.identityId);
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
    }
  }

  refreshConversations(): void {
    if (this.currentUserId) {
      console.log('Refreshing conversations...');
      this.store.dispatch(new LoadConversations(this.currentUserId));
    }
  }

  openConversation(convo: Conversation): void {
    const recipientId = this.getRecipientId(convo);
    const conversationId = getNormalizedConversationId(this.currentUserId!, recipientId);
    this.router.navigate(['/chat', conversationId, recipientId]);
  }

  getRecipientId(convo: Conversation): string {
    if (!this.currentUserId) return '';
    return convo.participantA === this.currentUserId ? convo.participantB : convo.participantA;
  }
}