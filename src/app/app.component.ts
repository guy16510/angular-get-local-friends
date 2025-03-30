import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
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
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { ChatService } from './services/chat.service';
import { ChatState } from './store/states/chat.state';
import { IncrementUnreadCount, ResetUnreadCount } from './store/actions/chat.actions';
import { ChatMessage } from './models/chat';
import { ProgressBarComponent } from './components/shared/progress-bar/progress-bar.component';
import { CommonModule } from '@angular/common';

Amplify.configure(outputs);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'], // Fixed property name here.
  imports: [
    RouterOutlet,
    AmplifyAuthenticatorModule,
    HeaderComponent,
    FooterComponent,
    ProgressBarComponent,
    CommonModule
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  private unreadSub: Subscription | null = null;
  private identitySub: Subscription | null = null;
  private heartbeatInterval: any = null;
  private liveMsgSub: Subscription | null = null;
  showProgressBar = false;

  constructor(
    public authenticator: AuthenticatorService,
    private store: Store,
    private snackBar: MatSnackBar,
    private chatService: ChatService,
    private router: Router
  ) {
    Amplify.configure(outputs);
    
    // Initialize the flag based on the current URL.
    this.showProgressBar = this.router.url.includes('survey');

    // Subscribe to router events to update the flag on navigation.
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Adjust the condition as needed if your survey route changes.
      this.showProgressBar = event.urlAfterRedirects.includes('survey');
    });
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
          // Fetch unread messages
          this.chatService.getUnreadMessages().subscribe({
            next: (messages: ChatMessage[]) => {
              this.store.dispatch(new ResetUnreadCount());
              if (messages.length > 0) {
                this.store.dispatch(new IncrementUnreadCount(messages.length));
                this.snackBar.open(`You have ${messages.length} unread messages`, 'Dismiss', { duration: 3000 });
              }
            },
            error: (err: any) => console.error('[AppComponent] getUnreadMessages error:', err)
          });
          // Optionally subscribe to live messages if needed...
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