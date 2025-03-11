import { Component, OnInit } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { LoadConversations, LoadMessages } from '../../store/actions/chat.actions';
import { ChatState } from '../../store/states/chat.state';
import { Conversation } from '../../models/chat';
import { MaterialModule } from '../../shared/material.module';
import { CommonModule } from '@angular/common';
import { UserProfileState } from '../../store/states/user-profile.state';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
  imports: [MaterialModule, CommonModule],
  standalone: true
})
export class ChatListComponent implements OnInit {
  @Select(ChatState.conversations) conversations$!: Observable<Conversation[]>;
  // Optionally, you can build selectors for loading/error state too if needed

  currentUserId: string = 'userA'; // Replace with actual user ID from AuthService

  constructor(private store: Store, private router: Router) {}

  ngOnInit(): void {
    const userId = this.store.selectSnapshot(UserProfileState.profile)?.identityId;
    if (userId) this.store.dispatch(new LoadConversations(userId));
  }
  
  openConversation(convo: Conversation) {
    this.store.dispatch(new LoadMessages(convo.conversationId));
    this.router.navigate(['/chat', convo.conversationId]); // example
  }
}