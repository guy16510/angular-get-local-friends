import { State, Action, StateContext, Store } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { AuthState } from './auth.state';

export class SetUserPresence {
  static readonly type = '[User] Set Presence';
  constructor(public isOnline: boolean) {}
}

@State<boolean>({
  name: 'userPresence',
  defaults: false,
})
@Injectable()
export class UserPresenceState {
  constructor(private chatService: ChatService, private store: Store) {}

  @Action(SetUserPresence)
  async setUserPresence(ctx: StateContext<boolean>, { isOnline }: SetUserPresence) {
    const userId = this.store.selectSnapshot(AuthState.identityId);
    if(userId){
      await this.chatService.setUserPresence(userId, isOnline ? 'online' : 'offline');
      ctx.setState(isOnline);
    }
  }
}