import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, Subject, Subscription, of } from 'rxjs';
import { debounceTime, takeUntil, map, switchMap } from 'rxjs/operators';
import { AppendMessage, LoadMessages, MarkMessagesAsRead, ReactToMessage, SendMessage, SetTypingStatus, LoadConversations, SetActiveConversation, FetchUnreadMessages } from '../../store/actions/chat.actions';
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
import { UserProfileState } from '../../store/states/user-profile.state';
import { LoadUserProfile } from '../../store/actions/user-profile.actions';
// import { ChatReactionComponent } from './chat-reaction/chat-reaction.component'; // adjust path if needed

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
  initialLoading: boolean = true;
  error$: Observable<string | null> = this.store.select(ChatState.getError);
  currentUserId: string | null = null;
  recipientUserName$!: Observable<string | null>;

  private lastMessageCount: number = 0;

  constructor(
    private store: Store,
    private chatService: ChatService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params: ParamMap) => {
      // Reset initialLoading when navigating to a new conversation
      this.initialLoading = true;
      this.recipientId = params.get('recipientId') || '';
      this.initializeConversation();
    });
  }

  initializeConversation(): void {
    this.currentUserId = this.store.selectSnapshot(AuthState.identityId);
    if (!this.currentUserId || !this.recipientId) {
      console.error('Missing current or recipient identityId');
      return;
    }
  
    this.conversationId = getNormalizedConversationId(this.currentUserId, this.recipientId);
    if (!this.conversationId) return;
  
    console.log(`[ChatComponent] Initializing chat for conversation: ${this.conversationId}`);
    
    // Set this as the active conversation
    this.store.dispatch(new SetActiveConversation(this.conversationId));
    
    this.store.dispatch(new LoadMessages(this.conversationId)).subscribe(() => {
      // Mark messages as read after loading
      this.markMessagesAsRead();
      
      // Set initialLoading to false after first load
      this.initialLoading = false;
    });
  
    const recipientUserName = this.store.selectSnapshot(UserProfileState.getUserNameById)(this.recipientId);
    if (!recipientUserName) {
      this.store.dispatch(new LoadUserProfile(this.recipientId));
    }
  
    this.messages$ = this.store.select(state =>
      ChatState.messagesForConversation(state.chat)(this.conversationId)
    );
  
    this.messageStoreSubscription = this.messages$.subscribe((messages) => {
      const currentCount = messages?.length ?? 0;
      if (currentCount > this.lastMessageCount) {
        setTimeout(() => this.scrollToBottom(), 0);
        
        // Check if we received new messages that should be marked as read
        if (this.lastMessageCount > 0) {
          this.markMessagesAsRead();
        }
      }
      this.lastMessageCount = currentCount;
    });
  
    this.messageSubscription = this.chatService
      .subscribeToMessagesForConversation(this.conversationId)
      .subscribe({
        next: (message: ChatMessage) => {
          if (message) {
            this.store.dispatch(new AppendMessage(message));
            // If the message is from the other user, mark it as read
            if (message.senderId === this.recipientId) {
              this.markMessagesAsRead();
            }
          }
        },
        error: (err) => console.error('[ChatComponent] Message subscription error:', err)
      });
  
    this.typingStatusSubscription = this.chatService
      .subscribeToTypingStatus(this.conversationId)
      .subscribe({
        next: ({ userId, isTyping }) => {
          if (userId !== this.currentUserId) {
            this.isOtherUserTyping = isTyping;
            if (!isTyping) setTimeout(() => this.scrollToBottom(), 0);
          }
        },
        error: (err) => console.error('[ChatComponent] Typing status subscription error:', err)
      });
  
    this.typingSubject.pipe(
      debounceTime(500),
      takeUntil(this.destroy$)
    ).subscribe((isTyping: boolean) => {
      this.store.dispatch(new SetTypingStatus(this.conversationId, isTyping));
    });
  
    this.recipientUserName$ = this.store.select(UserProfileState.getUserNameById).pipe(
      map(selector => selector?.(this.recipientId) || null)
    );
  }
  
  markMessagesAsRead(): void {
    this.store.dispatch(new MarkMessagesAsRead(this.conversationId)).subscribe(() => {
      // Also trigger a refresh of the conversations list to update unread counts
      if (this.currentUserId) {
        this.store.dispatch(new LoadConversations(this.currentUserId));
        this.store.dispatch(new FetchUnreadMessages());
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessageText.trim()) return;
    
    // Send the message
    this.store.dispatch(new SendMessage(this.recipientId, this.newMessageText));
    
    // Clear the input
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
    if (this.messagesContainer?.nativeElement) {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }
  }

  ngOnDestroy(): void {
    // Clear the active conversation on leaving
    this.store.dispatch(new SetActiveConversation(null as any));
    
    this.destroy$.next();
    this.destroy$.complete();
    this.messageSubscription?.unsubscribe();
    this.messageStoreSubscription?.unsubscribe();
    this.typingStatusSubscription?.unsubscribe();
  }

  openUserProfile(userId: string): void {
    this.router.navigate(['/user-bio', userId]);
  }

  getUserNameForMessage(senderId: string): string {
    return this.store.selectSnapshot(UserProfileState.getUserNameById)?.(senderId) || 'Friend';
  }

  handleAddReaction(emoji: string, messageId: string): void {
    this.store.dispatch(new ReactToMessage(messageId, emoji));
  }
  
}