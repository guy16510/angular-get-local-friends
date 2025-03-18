import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { UserProfile } from '../../models/user-profile.model';
import { UserProfileService } from '../../services/user-profile.service';
import {
  LoadUserProfile,
  LoadUserProfileSuccess,
  LoadUserProfileFail,
  SubmitUserProfile,
  UpdateUserOnlineStatus,
  
} from '../actions/user-profile.actions';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthState } from './auth.state';

export interface UserProfileStateModel {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

@State<UserProfileStateModel>({
  name: 'userProfile',
  defaults: {
    profile: null,
    loading: false,
    error: null
  }
})
@Injectable()
export class UserProfileState {
  constructor(private userProfileService: UserProfileService, private store: Store) { }

  @Selector()
  static profile(state: UserProfileStateModel) {
    return state.profile;
  }

  @Selector()
  static loading(state: UserProfileStateModel) {
    return state.loading;
  }

  @Selector()
  static error(state: UserProfileStateModel) {
    return state.error;
  }

  @Action(LoadUserProfile)
  loadUserProfile(ctx: StateContext<UserProfileStateModel>) {
    ctx.patchState({ loading: true, error: null });
    const identityId = this.store.selectSnapshot(AuthState.identityId);
    if (!identityId) {
      ctx.dispatch(new LoadUserProfileFail('Missing identityId'));
      return of();
    }

    return this.userProfileService.getUserProfile(identityId).pipe(
      tap((profile) => {
        ctx.dispatch(new LoadUserProfileSuccess(profile));
      }),
      catchError((err) => {
        ctx.dispatch(new LoadUserProfileFail(err.message || 'Unknown error'));
        return of(err);
      })
    );
  }

  @Action(LoadUserProfileSuccess)
  loadUserProfileSuccess(ctx: StateContext<UserProfileStateModel>, action: LoadUserProfileSuccess) {
    let parsedProfile: any;
    try {
      parsedProfile = JSON.parse(action.payload as unknown as string);
    } catch (e) {
      console.error('❌ Failed to parse user profile JSON string:', action.payload, e);
      parsedProfile = {};
    }

    if (typeof parsedProfile.surveyAnswers === 'string') {
      try {
        parsedProfile.surveyAnswers = JSON.parse(parsedProfile.surveyAnswers);
      } catch {
        parsedProfile.surveyAnswers = [];
      }
    }

    if (typeof parsedProfile.images === 'string') {
      try {
        parsedProfile.images = JSON.parse(parsedProfile.images);
      } catch {
        parsedProfile.images = [];
      }
    }

    ctx.patchState({
      profile: parsedProfile,
      loading: false,
      error: null
    });
  }

  @Action(LoadUserProfileFail)
  loadUserProfileFail(ctx: StateContext<UserProfileStateModel>, action: LoadUserProfileFail) {
    ctx.patchState({
      loading: false,
      error: action.error
    });
  }

  @Action(SubmitUserProfile)
  submitUserProfile(ctx: StateContext<UserProfileStateModel>, action: SubmitUserProfile) {
    ctx.patchState({ loading: true });
    return this.userProfileService.submitUserProfile(action.payload).pipe(
      tap((response) => {
        debugger;
        ctx.patchState({
          profile: response,
          loading: false,
          error: null
        });
      }),
      catchError((err) => {
        ctx.patchState({ loading: false, error: err.message || 'Unknown error' });
        return of(err);
      })
    );
  }
  @Action(UpdateUserOnlineStatus)
  updateUserOnlineStatus(ctx: StateContext<UserProfileStateModel>) {
    const identityId = this.store.selectSnapshot(AuthState.identityId);
    if (!identityId) return of();

    return this.userProfileService.onlinePing(identityId).pipe(
      tap(() => {
        // optional: patch lastPing timestamp if you want
        // ctx.patchState({ lastPing: new Date().toISOString() });
      }),
      catchError(err => {
        console.error('Online Ping failed:', err.message);
        return of(); // swallow errors silently
      })
    );
  }
}
