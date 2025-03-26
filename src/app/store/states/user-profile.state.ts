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
  LoadAnimalProfile,
  LoadAnimalProfileFail,
  LoadAnimalProfileSuccess
} from '../actions/user-profile.actions';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthState } from './auth.state';

export interface UserProfileStateModel {
  profile: UserProfile | null;
  profilesById: { [key: string]: UserProfile };
  loading: boolean;
  error: string | null;
}

@State<UserProfileStateModel>({
  name: 'userProfile',
  defaults: {
    profile: null,
    profilesById: {},
    loading: false,
    error: null
  }
})
@Injectable()
export class UserProfileState {
  constructor(private userProfileService: UserProfileService, private store: Store) {}

  @Selector()
  static profile(state: UserProfileStateModel) {
    return state.profile;
  }

  @Selector()
  static loading(state: UserProfileStateModel) {
    return state.loading;
  }

  @Selector()
  static getSelfProfile(state: UserProfileStateModel) {
    return state?.profile?.selfProfile;
  }

  @Selector()
  static getSeekingProfile(state: UserProfileStateModel) {
    return state?.profile?.seekingProfile;
  }

  @Selector()
  static getDeepInsights(state: UserProfileStateModel) {
    return state?.profile?.deepInsights;
  }

  @Selector()
  static error(state: UserProfileStateModel) {
    return state.error;
  }

  @Selector()
  static getUserNameById(state: UserProfileStateModel) {
    return (identityId: string) => state.profilesById[identityId]?.userName || null;
  }

  @Action(LoadUserProfile)
  loadUserProfile(ctx: StateContext<UserProfileStateModel>, action: LoadUserProfile) {
    ctx.patchState({ loading: true, error: null });
    const identityId = action.identityId || this.store.selectSnapshot(AuthState.identityId);
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

    if(parsedProfile){
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

    const state = ctx.getState();
    ctx.patchState({
      profile: parsedProfile,
      profilesById: {
        ...state.profilesById,
        [parsedProfile.identityId]: parsedProfile
      },
      loading: false,
      error: null
    });
  } else {
    const state = ctx.getState();
    ctx.patchState({
      profile: state.profile,
      profilesById: state.profilesById,
      loading: false,
      error: null
    });
  }
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
        ctx.patchState({
          profile: response,
          profilesById: {
            ...ctx.getState().profilesById,
            [response.identityId]: response
          },
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
      tap(() => {}),
      catchError(err => {
        console.error('Online Ping failed:', err.message);
        return of();
      })
    );
  }

  @Action(LoadAnimalProfile)
  loadAnimalProfile(ctx: StateContext<UserProfileStateModel>) {
    const identityId = this.store.selectSnapshot(AuthState.identityId);
    if (!identityId) {
      ctx.dispatch(new LoadAnimalProfileFail('Missing identityId'));
      return of();
    }

    ctx.patchState({ loading: true, error: null });
    return this.userProfileService.getAnimalProfile().pipe(
      tap((response) => {
        const currentProfile = ctx.getState().profile;

        const updatedProfile: UserProfile = {
          identityId: identityId,
          locationLat: currentProfile?.locationLat ?? 0,
          locationLng: currentProfile?.locationLng ?? 0,
          userName: currentProfile?.userName ?? '',
          surveyAnswers: currentProfile?.surveyAnswers ?? [],
          lastOnlineAt: currentProfile?.lastOnlineAt,
          selfProfile: response.selfProfile,
          seekingProfile: response.seekingProfile,
          deepInsights: response.deepInsights,
          animalProfileLoadedAt: new Date().toISOString()
        };

        ctx.patchState({
          profile: updatedProfile,
          profilesById: {
            ...ctx.getState().profilesById,
            [identityId]: updatedProfile
          },
          loading: false,
          error: null
        });
        ctx.dispatch(new LoadAnimalProfileSuccess(response));
      }),
      catchError(err => {
        ctx.patchState({ loading: false, error: err.message || 'Unknown error' });
        ctx.dispatch(new LoadAnimalProfileFail(err));
        return of(err);
      })
    );
  }
}
