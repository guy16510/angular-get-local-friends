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
  profilesById: { [key: string]: UserProfile };
  loading: boolean;
  error: string | null;
}

@State<UserProfileStateModel>({
  name: 'userProfile',
  defaults: {
    profilesById: {},
    loading: false,
    error: null
  }
})
@Injectable()
export class UserProfileState {
  constructor(private userProfileService: UserProfileService, private store: Store) {}

  @Selector()
  static loading(state: UserProfileStateModel): boolean {
    return state.loading;
  }
  
  @Selector()
  static error(state: UserProfileStateModel): string | null {
    return state.error;
  }
  
  @Selector()
  static getUserNameById(state: UserProfileStateModel) {
    return (identityId: string): string | null =>
      state.profilesById[identityId]?.userName ?? null;
  }
  
  @Selector()
  static getProfileById(state: UserProfileStateModel) {
    return (id: string): UserProfile | null => state.profilesById[id] ?? null;
  }
  
  @Selector([AuthState.identityId])
  static currentUserProfile(state: UserProfileStateModel, identityId: string | null): UserProfile | null {
    return identityId ? state.profilesById[identityId] ?? null : null;
  }
  
  @Selector([AuthState.identityId])
  static getSelfProfile(state: UserProfileStateModel, identityId: string | null) {
    return identityId ? state.profilesById[identityId]?.selfProfile ?? null : null;
  }
  
  @Selector([AuthState.identityId])
  static getSeekingProfile(state: UserProfileStateModel, identityId: string | null) {
    return identityId ? state.profilesById[identityId]?.seekingProfile ?? null : null;
  }
  
  @Selector([AuthState.identityId])
  static getDeepInsights(state: UserProfileStateModel, identityId: string | null) {
    return identityId ? state.profilesById[identityId]?.deepInsights ?? null : null;
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
      tap((response) => {
        let profile: any;
        try {
          profile = typeof response === 'string' ? JSON.parse(response) : response;
        } catch (err) {
          console.error('❌ Failed to parse user profile JSON string:', response, err);
          ctx.dispatch(new LoadUserProfileFail('Invalid user profile format'));
          return;
        }

        if (!profile || typeof profile !== 'object' || !profile.identityId) {
          ctx.dispatch(new LoadUserProfileFail('No valid user profile found'));
          return;
        }

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
    const raw = action.payload as any;

    if (!raw || typeof raw !== 'object' || !raw.identityId) {
      console.warn('⚠️ LoadUserProfileSuccess called with invalid payload:', raw);
      return;
    }

    const parsedProfile: UserProfile = {
      identityId: raw.identityId,
      locationLat: raw.locationLat ?? 0,
      locationLng: raw.locationLng ?? 0,
      userName: raw.userName ?? '',
      surveyAnswers: typeof raw.surveyAnswers === 'string' ? JSON.parse(raw.surveyAnswers) : raw.surveyAnswers ?? [],
      ageRange: raw.ageRange,
      desiredFriendAgeRanges: raw.desiredFriendAgeRanges ? JSON.parse(raw.desiredFriendAgeRanges) : [],
      gender: raw.gender,
      genderFriendPreference: raw.genderFriendPreference,
      hasKids: raw.hasKids,
      wantsFriendsWithKids: raw.wantsFriendsWithKids,
      childAgeGroups: raw.childAgeGroups ? JSON.parse(raw.childAgeGroups) : [],
      wantsSimilarChildAges: raw.wantsSimilarChildAges,
      lastOnlineAt: raw.lastOnlineAt,
      selfProfile: raw.selfProfile,
      seekingProfile: raw.seekingProfile,
      deepInsights: raw.deepInsights,
      animalProfileLoadedAt: raw.animalProfileLoadedAt
    };

    ctx.patchState({
      profilesById: {
        ...ctx.getState().profilesById,
        [parsedProfile.identityId]: parsedProfile
      },
      loading: false,
      error: null
    });
  }

  @Action(LoadUserProfileFail)
  loadUserProfileFail(ctx: StateContext<UserProfileStateModel>, action: LoadUserProfileFail) {
    ctx.patchState({ loading: false, error: action.error });
  }

  @Action(SubmitUserProfile)
  submitUserProfile(ctx: StateContext<UserProfileStateModel>, action: SubmitUserProfile) {
    ctx.patchState({ loading: true });
    return this.userProfileService.submitUserProfile(action.payload).pipe(
      tap((response) => {
        ctx.patchState({
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
  updateUserOnlineStatus() {
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
        const currentProfile = ctx.getState().profilesById[identityId];

        if (!currentProfile) {
          ctx.dispatch(new LoadAnimalProfileFail('No profile loaded to attach animal data'));
          return;
        }

        const updatedProfile: UserProfile = {
          ...currentProfile,
          selfProfile: response.selfProfile,
          seekingProfile: response.seekingProfile,
          deepInsights: response.deepInsights,
          animalProfileLoadedAt: new Date().toISOString()
        };

        ctx.patchState({
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
