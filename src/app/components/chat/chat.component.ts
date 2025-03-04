import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { Select, Store } from '@ngxs/store';
import { ChatState} from '../../store/states/chat.state';
import { AddMessage, SetMessagesLoading, SetMessagesError } from '../../store/actions/chat.actions';
import { ChatMessage } from '../../models/chat'; // Your ChatMessage model interface
import { MaterialModule } from '../../shared/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  imports: [MaterialModule, CommonModule, FormsModule, LoadingComponent],
  standalone: true
})
export class ChatComponent implements OnInit, OnDestroy {
  // Example conversationId; in a real app, you’d determine this dynamically.
  conversationId: string = 'userA#userB';
  newMessage: string = '';
  private messageSubscription!: Subscription;

  // NGXS selectors to read messages, loading, and error states.
  @Select(ChatState.getMessages) messages$!: Observable<ChatMessage[]>;
  @Select(ChatState.isMessagesLoading) loading$!: Observable<boolean>;
  @Select(ChatState.getMessagesError) error$!: Observable<string | null>;

  // In a real app these would come from your auth service.
  currentUserId: string = 'userA';
  currentRecipientId: string = 'userB';

  constructor(private chatService: ChatService, private store: Store) {}

  ngOnInit(): void {
    // Start by indicating that messages are loading.
    this.store.dispatch(new SetMessagesLoading(true));
    
    // Subscribe to new messages for this conversation.
    this.messageSubscription = this.chatService
      .subscribeToMessages(this.conversationId)
      .subscribe(
        (data: any) => {
          // Adjust this based on your Amplify subscription response.
          const message: ChatMessage = data.value.data.onCreateMessage;
          if (message.conversationId === this.conversationId) {
            this.store.dispatch(new AddMessage(message));
          }
          this.store.dispatch(new SetMessagesLoading(false));
        },
        (error) => {
          console.error('Subscription error:', error);
          this.store.dispatch(new SetMessagesError(error.message || 'Error loading messages'));
          this.store.dispatch(new SetMessagesLoading(false));
        }
      );
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      this.chatService
        .sendMessage({
          senderId: this.currentUserId,
          recipientId: this.currentRecipientId,
          text: this.newMessage,
        })
        .then(() => {
          this.newMessage = '';
        })
        .catch(err => {
          console.error('Error sending message:', err);
          this.store.dispatch(new SetMessagesError(err.message || 'Error sending message'));
        });
    }
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
}