import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import { HeaderComponent } from './components/shared/header/header.component';
import { AmplifyAuthenticatorModule, AuthenticatorService } from '@aws-amplify/ui-angular';
import { FooterComponent } from './components/shared/footer/footer.component';
// import { ToastMessageComponent } from './components/shared/toast-message/toast-message.component';
import { Store } from '@ngxs/store';
import { UpdateUserOnlineStatus } from './store/actions/user-profile.actions';
import { AuthState } from './store/states/auth.state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ChatService } from './services/chat.service';
import { ChatState } from './store/states/chat.state';

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
          console.log("HEARTBEAT")
          // If identityId exists, start heartbeat if not already started
          if (!this.heartbeatInterval) {
            this.heartbeatInterval = setInterval(() => {
              this.store.dispatch(new UpdateUserOnlineStatus());
            }, 120000); // every 2 minutes
          }
          // If identityId exists, subscribe to unread messages if not already subscribed
          if (!this.unreadSub) {
            this.unreadSub = this.chatService.subscribeToUnreadMessages()
              .pipe(debounceTime(500))
              .subscribe({
                next: (notification: any) => {
                  console.log("CONVERSATION");
                  const activeConversationId = this.store.selectSnapshot(ChatState.activeConversationId);
                  // Only show toast if the notification's conversationId is different from the active one
                  if (notification?.conversationId && notification.conversationId !== activeConversationId) {
                    this.snackBar.open('New unread message', 'Dismiss', { duration: 3000 });
                  }
                },
                error: (err: any) => console.error('[AppComponent] notifyUnreadMessage error:', err)
              });
          }
        } else {
          // If identityId becomes null, clear heartbeat and unsubscribe from unread messages if needed
          if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
          }
          if (this.unreadSub) {
            this.unreadSub.unsubscribe();
            this.unreadSub = null;
          }
        }
      });
  }

  ngOnDestroy(): void {
    if (this.identitySub) {
      this.identitySub.unsubscribe();
    }
    if (this.unreadSub) {
      this.unreadSub.unsubscribe();
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }
}
