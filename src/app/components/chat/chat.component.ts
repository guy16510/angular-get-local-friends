import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { Select, Store } from '@ngxs/store';
import { ChatState } from '../../store/states/chat.state';
import { AddMessage, SetMessagesLoading, SetMessagesError } from '../../store/actions/chat.actions';
import { ChatMessage } from '../../models/chat';
import { AuthState } from '../../store/states/auth.state';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../shared/loading/loading.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  imports: [CommonModule, MaterialModule, FormsModule, LoadingComponent]
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('messageList') messageList!: ElementRef;

  @Select(ChatState.getMessages) messages$!: Observable<ChatMessage[]>;
  @Select(ChatState.isMessagesLoading) loading$!: Observable<boolean>;
  @Select(ChatState.getMessagesError) error$!: Observable<string | null>;

  newMessage: string = '';
  conversationId: string = '';
  currentUserId: string | null = null;
  currentRecipientId: string = '';

  private messageSubscription!: Subscription;

  constructor(
    private store: Store,
    private chatService: ChatService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Pull current user from state
    this.currentUserId = this.store.selectSnapshot(AuthState.identityId) || null;
    this.currentRecipientId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.currentUserId || !this.currentRecipientId) {
      console.error('❌ Missing user IDs for conversation');
      this.store.dispatch(new SetMessagesError('Missing conversation details.'));
      return;
    }

    this.conversationId = this.buildConversationId(this.currentUserId, this.currentRecipientId);
    this.store.dispatch(new SetMessagesLoading(true));

    this.messageSubscription = this.chatService
      .subscribeToMessages(this.conversationId)
      .subscribe(
        (data: any) => {
          const message: ChatMessage = data?.value?.data?.onCreateMessage;
          if (message && message.conversationId === this.conversationId) {
            this.store.dispatch(new AddMessage(message));
            setTimeout(() => this.scrollToBottom(), 50);
          }
          this.store.dispatch(new SetMessagesLoading(false));
        },
        (error) => {
          console.error('❌ Message subscription failed:', error);
          this.store.dispatch(new SetMessagesError(error.message || 'Error loading messages'));
          this.store.dispatch(new SetMessagesLoading(false));
        }
      );
  }

  sendMessage(): void {
    const trimmed = this.newMessage.trim();
    if (!trimmed) return;

    this.chatService
      .sendMessage({
        senderId: this.currentUserId,
        recipientId: this.currentRecipientId,
        text: trimmed
      })
      .then(() => {
        this.newMessage = '';
        setTimeout(() => this.scrollToBottom(), 100);
      })
      .catch((err) => {
        console.error('❌ Failed to send message:', err);
        this.store.dispatch(new SetMessagesError(err.message || 'Failed to send message'));
      });
  }

  scrollToBottom(): void {
    try {
      this.messageList?.nativeElement?.scrollTo({
        top: this.messageList.nativeElement.scrollHeight,
        behavior: 'smooth'
      });
    } catch (err) {
      console.warn('📦 Failed scrollToBottom:', err);
    }
  }

  buildConversationId(a: string, b: string): string {
    return [a, b].sort().join('#');
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
}