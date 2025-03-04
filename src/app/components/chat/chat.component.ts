import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { ChatState } from '../../store/states/chat.state';
import { ChatMessage } from '../../models/chat';
import { ChatService } from '../../services/chat.service';
import { ReceiveMessage } from '../../store/actions/chat.actions';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  @Select(ChatState.messages) messages$!: Observable<ChatMessage[]>;
  newMessage: string = '';
  userId: string = 'user-123';

  // Hold the subscription so we can unsubscribe later
  private messageSubscription!: Subscription;

  constructor(private chatService: ChatService, private store: Store) {}

  ngOnInit(): void {
    // Subscribe to new messages via AppSync
    this.messageSubscription = this.chatService.subscribeToMessages().subscribe((data: any) => {
      // Adjust based on Amplify's nested response
      const message = data.value.data.onCreateMessage;
      this.store.dispatch(new ReceiveMessage({ message }));
    });
  }

  sendMessage(): void {
    if (this.newMessage.trim() !== '') {
      this.chatService
        .sendMessage({ userId: this.userId, text: this.newMessage })
        .then(() => {
          this.newMessage = '';
        })
        .catch((err: any) => {
          console.error('Error sending message', err);
        });
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe when the component is destroyed to close the connection
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
}