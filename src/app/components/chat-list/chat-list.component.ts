import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import {SetConversations, SetConversationsError, SetConversationsLoading} from '../../store/actions/chat.actions';
import { ChatState } from '../../store/states/chat.state'; // Assume you have defined these actions
import { Conversation } from '../../models/chat'; // Your Conversation interface
import { MaterialModule } from '../../shared/material.module';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
  imports: [MaterialModule, CommonModule, LoadingComponent],
  standalone: true
})
export class ChatListComponent implements OnInit {
  @Select(ChatState.getConversations) conversations$!: Observable<Conversation[]>;
  @Select(ChatState.isConversationsLoading) loading$!: Observable<boolean>;
  @Select(ChatState.getConversationsError) error$!: Observable<string | null>;

  // In a real app, currentUserId would come from your authentication service.
  currentUserId: string = 'userA';

  constructor(private chatService: ChatService, private store: Store) {}

  ngOnInit(): void {
    // Set the loading flag before fetching conversations.
    this.store.dispatch(new SetConversationsLoading(true));
    this.chatService.listConversations(this.currentUserId)
      .then((result: any) => {
        // Assume result is a JSON string containing an array of Conversation objects.
        const conversations: Conversation[] = JSON.parse(result);
        this.store.dispatch(new SetConversations(conversations));
        this.store.dispatch(new SetConversationsLoading(false));
      })
      .catch(err => {
        console.error('Error fetching conversations:', err);
        this.store.dispatch(new SetConversationsError(err.message || 'Error loading conversations'));
        this.store.dispatch(new SetConversationsLoading(false));
      });
  }

  openConversation(conversation: Conversation) {
    // Implement navigation or state-setting to open the selected conversation.
    console.log('Opening conversation:', conversation);
  }
}