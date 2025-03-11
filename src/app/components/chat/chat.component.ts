import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { LoadMessages, SendMessage } from '../../store/actions/chat.actions';
import { ChatState } from '../../store/states/chat.state';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  imports: [CommonModule, MaterialModule, FormsModule],
  standalone: true
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() recipientId!: string;
  currentUserId = 'userA'; // Replace with actual auth user
  conversationId = '';
  messages$ = this.store.select(ChatState.messages);
  newMessageText = '';
  private sub: Subscription | null = null;

  constructor(private store: Store) {}

  ngOnInit(): void {
    //TODO update this.
    // this.messages$ = this.store.select(state => ChatState.messagesForConversation(state.chat)(this.conversationId));
    this.store.dispatch(new LoadMessages(this.conversationId));
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