import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import { HeaderComponent } from './components/shared/header/header.component';
import { AmplifyAuthenticatorModule, AuthenticatorService } from '@aws-amplify/ui-angular';
import { FooterComponent } from './components/shared/footer/footer.component';
import { Store } from '@ngxs/store';
import { UpdateUserOnlineStatus } from './store/actions/user-profile.actions';
import { AuthState } from './store/states/auth.state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ChatService } from './services/chat.service';
import { ChatState } from './store/states/chat.state';
import { IncrementUnreadCount, ResetUnreadCount } from './store/actions/chat.actions';
import { ChatMessage } from './models/chat';

Amplify.configure(outputs);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [
    RouterOutlet,
    AmplifyAuthenticatorModule,
    HeaderComponent,
    FooterComponent
  ]
})
export class AppComponent implements OnInit, OnDestroy {

  private unreadSub: Subscription | null = null;
  private identitySub: Subscription | null = null;
  private heartbeatInterval: any = null;
  private liveMsgSub: Subscription | null = null;

  constructor(
    public authenticator: AuthenticatorService,
    private store: Store,
    private snackBar: MatSnackBar,
    private chatService: ChatService
  ) {
    Amplify.configure(outputs);
  }

  ngOnInit() {
    this.identitySub = this.store.select(AuthState.identityId)
      .pipe(distinctUntilChanged())
      .subscribe(identityId => {
        if (identityId) {
          console.log("HEARTBEAT");
          // Start heartbeat if not already started
          if (!this.heartbeatInterval) {
            this.heartbeatInterval = setInterval(() => {
              this.store.dispatch(new UpdateUserOnlineStatus());
            }, 120000); // every 2 minutes
          }
          // On login, fetch unread messages from the query and update state
          this.chatService.getUnreadMessages().subscribe({
            next: (messages: ChatMessage[]) => {
              // Dispatch a reset then increment by the number of unread messages
              this.store.dispatch(new ResetUnreadCount());
              if (messages.length > 0) {
                this.store.dispatch(new IncrementUnreadCount(messages.length));
                this.snackBar.open(`You have ${messages.length} unread messages`, 'Dismiss', { duration: 3000 });
              }
            },
            error: (err: any) => console.error('[AppComponent] getUnreadMessages error:', err)
          });
          // Subscribe to live new messages via onCreateMessage
          if (!this.liveMsgSub) {
            //TODO.. should this be done?
            // this.liveMsgSub = this.chatService.subscribeToMessagesForConversation(/* you might loop over all conversations or subscribe per conversation */)
            //   .pipe(debounceTime(500))
            //   .subscribe({
            //     next: (message: ChatMessage) => {
            //       const currentUserId = this.store.selectSnapshot(AuthState.identityId);
            //       const activeConversationId = this.store.selectSnapshot(ChatState.activeConversationId);
            //       // Only act if the current user is the recipient and message is not in the active conversation
            //       if (message.recipientId === currentUserId && message.conversationId !== activeConversationId) {
            //         this.store.dispatch(new IncrementUnreadCount());
            //         this.snackBar.open('New message received', 'Dismiss', { duration: 3000 });
            //       }
            //     },
            //     error: (err: any) => console.error('[AppComponent] live message subscription error:', err)
            //   });
          }
          // Subscribe to unread messages query (if you want to poll periodically, add additional logic)
        } else {
          // Clear heartbeat and unsubscribe when identity becomes null
          if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
          }
          if (this.unreadSub) {
            this.unreadSub.unsubscribe();
            this.unreadSub = null;
          }
          if (this.liveMsgSub) {
            this.liveMsgSub.unsubscribe();
            this.liveMsgSub = null;
          }
        }
      });
  }

  ngOnDestroy(): void {
    if (this.identitySub) { this.identitySub.unsubscribe(); }
    if (this.unreadSub) { this.unreadSub.unsubscribe(); }
    if (this.liveMsgSub) { this.liveMsgSub.unsubscribe(); }
    if (this.heartbeatInterval) { clearInterval(this.heartbeatInterval); }
  }
}