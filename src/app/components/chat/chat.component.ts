import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
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
  private messagesSub: Subscription | null = null;
  private typingSubject: Subject<boolean> = new Subject<boolean>();
  private typingStatusSub: Subscription | null = null;

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
    if (this.currentUserId) {
      this.conversationId = getNormalizedConversationId(this.currentUserId, this.recipientId);
    }

    if (!this.conversationId || !this.recipientId) {
      console.error('Missing conversationId or recipientId');
      return;
    }

    this.store.dispatch(new LoadMessages(this.conversationId));
    this.messages$ = this.store.select(state =>
      ChatState.messagesForConversation(state.chat)(this.conversationId)
    );

    // Auto-scroll when messages arrive.
    this.messagesSub = this.messages$.subscribe(() => {
      setTimeout(() => this.scrollToBottom(), 0);
    });

    // Subscribe to typing status updates.
    this.typingStatusSub = this.chatService
      .subscribeToTypingStatus(this.conversationId)
      .subscribe((statusUpdate: { conversationId: string; userId: string; isTyping: boolean }) => {
        if (statusUpdate.userId === this.currentUserId) {
          console.log('Ignoring self typing status update:', statusUpdate);
          return;
        }
        console.log('Received typing status update from other user:', statusUpdate);
        this.isOtherUserTyping = statusUpdate.isTyping;
      });

    // Detect and debounce our own typing.
    this.typingSubject.pipe(debounceTime(500)).subscribe((isTyping: boolean) => {
      this.store.dispatch(new SetTypingStatus(this.conversationId, isTyping));
    });
  }

  sendMessage(): void {
    if (!this.newMessageText.trim()) return;
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
    this.messagesSub?.unsubscribe();
    this.typingStatusSub?.unsubscribe();
  }
}