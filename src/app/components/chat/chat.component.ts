import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { AppendMessage, LoadMessages, SendMessage, SetTypingStatus } from '../../store/actions/chat.actions';
import { ChatService } from '../../services/chat.service';
import { ChatMessage } from '../../models/chat';
import { ChatState } from '../../store/states/chat.state';
import { AuthState } from '../../store/states/auth.state';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { getNormalizedConversationId } from '../../utils/chat-utils';
import { ImageDisplayComponent } from '../image-display/image-display.component';
import { LoadingComponent } from '../shared/loading/loading.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, ImageDisplayComponent, LoadingComponent]
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  private destroy$ = new Subject<void>();
  private typingSubject: Subject<boolean> = new Subject<boolean>();
  private messageSubscription: Subscription | null = null;
  private messageStoreSubscription: Subscription | null = null;
  private typingStatusSubscription: Subscription | null = null;

  newMessageText: string = '';
  isOtherUserTyping: boolean = false;
  conversationId!: string;
  recipientId!: string;
  messages$!: Observable<ChatMessage[]>;
  loading$: Observable<boolean> = this.store.select(ChatState.getLoading);
  error$: Observable<string | null> = this.store.select(ChatState.getError);
  currentUserId: string | null = null;

  constructor(
    private store: Store,
    private chatService: ChatService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.recipientId = this.route.snapshot.paramMap.get('recipientId') || '';
    this.currentUserId = this.store.selectSnapshot(AuthState.identityId);
    
    if (!this.currentUserId) {
      console.error('User not authenticated');
      return;
    }
    
    this.conversationId = getNormalizedConversationId(this.currentUserId, this.recipientId);

    if (!this.conversationId || !this.recipientId) {
      console.error('Missing conversationId or recipientId');
      return;
    }

    console.log(`[ChatComponent] Initializing chat for conversation: ${this.conversationId}`);
    
    // Load initial messages
    this.store.dispatch(new LoadMessages(this.conversationId));
    
    // Get messages from store
    this.messages$ = this.store.select(state =>
      ChatState.messagesForConversation(state.chat)(this.conversationId)
    );

    // Auto-scroll when messages arrive
    this.messageStoreSubscription = this.messages$.subscribe(() => {
      setTimeout(() => this.scrollToBottom(), 0);
    });

    // Subscribe to real-time messages for this conversation
    console.log(`[ChatComponent] Setting up message subscription for conversation: ${this.conversationId}`);
    this.messageSubscription = this.chatService
      .subscribeToMessagesForConversation(this.conversationId)
      .subscribe({
        next: (message: ChatMessage) => {
          console.log('[ChatComponent] Received new message via subscription:', message);
          if (message) {
            // Dispatch to store to update UI
            this.store.dispatch(new AppendMessage(message));
          }
        },
        error: (err) => {
          console.error('[ChatComponent] Message subscription error:', err);
        }
      });

    // Subscribe to typing status updates
    this.typingStatusSubscription = this.chatService
      .subscribeToTypingStatus(this.conversationId)
      .subscribe({
        next: (statusUpdate: { conversationId: string; userId: string; isTyping: boolean }) => {
          if (statusUpdate.userId === this.currentUserId) {
            console.log('[ChatComponent] Ignoring self typing status update:', statusUpdate);
            return;
          }
          console.log('[ChatComponent] Received typing status update from other user:', statusUpdate);
          this.isOtherUserTyping = statusUpdate.isTyping;
        },
        error: (err) => {
          console.error('[ChatComponent] Typing status subscription error:', err);
        }
      });

    // Detect and debounce our own typing
    this.typingSubject.pipe(
      debounceTime(500),
      takeUntil(this.destroy$)
    ).subscribe((isTyping: boolean) => {
      this.store.dispatch(new SetTypingStatus(this.conversationId, isTyping));
    });
  }

  sendMessage(): void {
    if (!this.newMessageText.trim()) return;
    console.log(`[ChatComponent] Sending message to ${this.recipientId}: ${this.newMessageText}`);
    this.store.dispatch(new SendMessage(this.recipientId, this.newMessageText));
    this.newMessageText = '';
    this.typingSubject.next(false);
  }

  onInputChange(): void {
    this.typingSubject.next(true);
  }

  onInputBlur(): void {
    this.typingSubject.next(false);
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  ngOnDestroy(): void {
    console.log('[ChatComponent] Cleaning up subscriptions');
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    
    if (this.messageStoreSubscription) {
      this.messageStoreSubscription.unsubscribe();
    }
    
    if (this.typingStatusSubscription) {
      this.typingStatusSubscription.unsubscribe();
    }
  }
}