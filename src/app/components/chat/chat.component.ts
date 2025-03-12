import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { LoadMessages, SendMessage } from '../../store/actions/chat.actions';
import { ChatService } from '../../services/chat.service';
import { ChatMessage } from '../../models/chat';
import { ChatState } from '../../store/states/chat.state';
import { AuthState } from '../../store/states/auth.state';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule]
})
export class ChatComponent implements OnInit, OnDestroy {
  conversationId!: string;
  recipientId!: string;
  messages$!: Observable<ChatMessage[]>;
  newMessageText: string = '';
  currentUserId: string = '';
  private sub: Subscription | null = null;

  constructor(
    private store: Store,
    private chatService: ChatService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const identity = this.store.selectSnapshot(AuthState.identityId);
    if (!identity) {
      console.error('AuthState.identityId is null — aborting chat init');
      return;
    }

    this.currentUserId = identity;
    this.conversationId = this.route.snapshot.paramMap.get('conversationId') || '';
    this.recipientId = this.route.snapshot.paramMap.get('recipientId') || '';

    if (!this.conversationId || !this.recipientId) {
      console.error('Missing conversationId or recipientId');
      return;
    }

    this.store.dispatch(new LoadMessages(this.conversationId));
    this.messages$ = this.store.select(state =>
      ChatState.messagesForConversation(state.chat)(this.conversationId)
    );

    this.sub = this.chatService.subscribeToMessages(this.conversationId).subscribe(() => {
      this.store.dispatch(new LoadMessages(this.conversationId));
    });
  }

  sendMessage(): void {
    if (!this.newMessageText.trim()) return;

    this.store.dispatch(new SendMessage(this.currentUserId, this.recipientId, this.newMessageText));
    this.newMessageText = '';
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}