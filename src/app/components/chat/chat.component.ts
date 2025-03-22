import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, Subscription, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import {
  AppendMessage,
  LoadMessages,
  SendMessage,
  AcknowledgeMessage,
  MarkMessageAsRead,
  SetTypingStatus
} from '../../store/actions/chat.actions';
import { ChatService } from '../../services/chat.service';
import { ChatMessage } from '../../models/chat';
import { ChatState } from '../../store/states/chat.state';
import { AuthState } from '../../store/states/auth.state';
import { getNormalizedConversationId } from '../../utils/chat-utils';
import { LoadingComponent } from '../shared/loading/loading.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { FormsModule } from '@angular/forms';
import { ImageDisplayComponent } from '../image-display/image-display.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, ImageDisplayComponent, LoadingComponent]
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  private messagesSub: Subscription | null = null;
  private subscriptionToNewMessages: Subscription | null = null;
  private typingSubject: Subject<boolean> = new Subject<boolean>();
  private typingSubscription: Subscription | null = null;

  newMessageText: string = '';
  isOtherUserTyping: boolean = false; // Extend with real-time logic if needed.
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
    // Set up conversation ID based on route and current user.
    this.recipientId = this.route.snapshot.paramMap.get('recipientId') || '';
    this.currentUserId = this.store.selectSnapshot(AuthState.identityId);
    if (this.currentUserId) {
      this.conversationId = getNormalizedConversationId(this.currentUserId, this.recipientId);
    }
    if (!this.conversationId || !this.recipientId) {
      console.error('Missing conversationId or recipientId');
      return;
    }

    // Load messages from the state.
    this.store.dispatch(new LoadMessages(this.conversationId));
    this.messages$ = this.store.select(state =>
      ChatState.messagesForConversation(state.chat)(this.conversationId)
    );

    // Auto-scroll and mark messages as read when new messages come in.
    this.messagesSub = this.messages$.subscribe((messages) => {
      setTimeout(() => {
        this.scrollToBottom();
        // this.markUnreadMessagesAsRead(messages);
      }, 0);
    });

    // Subscribe to new incoming messages.
    this.subscriptionToNewMessages = this.chatService.subscribeToMessagesForConversation(
      this.conversationId,
      (message: ChatMessage) => {
        this.store.dispatch(new AppendMessage(this.conversationId, message));
        // If the new message is from someone else, acknowledge and mark it as read.
        // if (this.currentUserId && message.senderId !== this.currentUserId) {
          // this.store.dispatch(new AcknowledgeMessage(message.id));
          // this.store.dispatch(new MarkMessageAsRead(message.id, this.conversationId, this.currentUserId));
        // }
      }
    );

    // Set up typing detection with debounce.
    this.typingSubscription = this.typingSubject
      .pipe(debounceTime(500))
      .subscribe(isTyping => {
        this.store.dispatch(new SetTypingStatus(this.conversationId, isTyping));
      });
  }

  sendMessage() {
    if (!this.newMessageText.trim()) return;
    this.store.dispatch(new SendMessage(this.conversationId, this.newMessageText));
    this.newMessageText = '';
    // User stops typing after sending a message.
    this.typingSubject.next(false);
  }

  onInputChange() {
    // User is typing—set typing status to true.
    this.typingSubject.next(true);
  }

  onInputBlur() {
    // Input loses focus—reset typing status.
    this.typingSubject.next(false);
  }

  private scrollToBottom() {
    if (this.messagesContainer) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  // private markUnreadMessagesAsRead(messages: ChatMessage[]) {
  //   // For each message not from the current user and not already read, dispatch the action.
  //   if (!this.currentUserId) return;
  //   messages.forEach(message => {
  //     if (message.senderId !== this.currentUserId && message.status !== 'read' && this.currentUserId !== null) {
  //       this.store.dispatch(new MarkMessageAsRead(message.id, this.conversationId, this.currentUserId));
  //     }
  //   });
  // }

  ngOnDestroy(): void {
    this.messagesSub?.unsubscribe();
    this.subscriptionToNewMessages?.unsubscribe();
    this.typingSubscription?.unsubscribe();
  }
}