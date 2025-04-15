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
  LoadAnimalProfileSuccess,
  LoadAnimalProfileFail
} from '../actions/user-profile.actions';
import {
  EnrollPremium,
  EnrollPremiumSuccess,
  EnrollPremiumFail,
  RemovePremium,
  RemovePremiumSuccess,
  RemovePremiumFail
} from '../actions/premium.actions';
import { tap, catchError, switchMap, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthState } from './auth.state';
import { PremiumService } from '../../services/premium.service';

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
  constructor(
    private userProfileService: UserProfileService,
    private premiumService: PremiumService,
    private store: Store
  ) {}

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
  
  @Selector([AuthState.identityId])
  static isPremium(state: UserProfileStateModel, identityId: string | null): boolean {
    const currentUser = this.currentUserProfile(state, identityId);
    return currentUser?.premiumEnrolledAt ? true : false;
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
      animalProfileLoadedAt: raw.animalProfileLoadedAt,
      premiumEnrolledAt: raw.premiumEnrolledAt
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
        // Merge the submitted payload with the response.
        // This assumes that any overlapping fields from the response take precedence.
        const mergedProfile = {
          ...action.payload,
          ...response
        };
  
        ctx.patchState({
          profilesById: {
            ...ctx.getState().profilesById,
            [mergedProfile.identityId]: mergedProfile
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

  @Action(EnrollPremium)
  enrollPremium(ctx: StateContext<UserProfileStateModel>) {
    ctx.patchState({ loading: true, error: null });
    
    const identityId = this.store.selectSnapshot(AuthState.identityId);
    if (!identityId) {
      ctx.dispatch(new EnrollPremiumFail('User not authenticated'));
      return of();
    }

    const currentUser = UserProfileState.currentUserProfile(ctx.getState(), identityId);
    if (!currentUser) {
      // If no profile found, load it first
      return this.userProfileService.getUserProfile(identityId).pipe(
        switchMap(loadedProfile => {
          if (!loadedProfile) {
            throw new Error('Failed to load user profile');
          }

          let parsedProfile;
          try {
            parsedProfile = typeof loadedProfile === 'string' ? JSON.parse(loadedProfile) : loadedProfile;
          } catch (err) {
            console.error('Failed to parse user profile:', loadedProfile, err);
            throw new Error('Invalid user profile format');
          }

          if (!parsedProfile || typeof parsedProfile !== 'object' || !parsedProfile.identityId) {
            throw new Error('Invalid user profile data');
          }

          // Update state with loaded profile
          ctx.patchState({
            profilesById: {
              ...ctx.getState().profilesById,
              [identityId]: parsedProfile
            }
          });
          // Proceed with premium enrollment
          return this.premiumService.enrollPremium().pipe(
            map(response => ({ response, profile: parsedProfile }))
          );
        }),
        tap(({ response, profile }) => {
          if (!response || response.statusCode === 500) {
            throw new Error(response?.body?.message || 'Failed to enroll in premium');
          }

          const updatedProfile = {
            ...profile,
            premiumEnrolledAt: new Date().toISOString()
          };

          ctx.dispatch(new EnrollPremiumSuccess());
          ctx.patchState({
            profilesById: {
              ...ctx.getState().profilesById,
              [identityId]: updatedProfile
            },
            loading: false
          });
        }),
        catchError(error => {
          console.error('Premium enrollment error:', error);
          ctx.dispatch(new EnrollPremiumFail(error.message));
          ctx.patchState({
            loading: false,
            error: error.message
          });
          return of(error);
        })
      );
    }

    // If profile exists, proceed with premium enrollment
    return this.premiumService.enrollPremium().pipe(
      tap((response) => {
        if (!response || response.statusCode === 500) {
          throw new Error(response?.body?.message || 'Failed to enroll in premium');
        }

        const updatedProfile = {
          ...currentUser, // currentUser is guaranteed to exist here
          premiumEnrolledAt: new Date().toISOString()
        };

        ctx.dispatch(new EnrollPremiumSuccess());
        ctx.patchState({
          profilesById: {
            ...ctx.getState().profilesById,
            [identityId]: updatedProfile
          },
          loading: false
        });
      }),
      catchError(error => {
        console.error('Premium enrollment error:', error);
        ctx.dispatch(new EnrollPremiumFail(error.message));
        ctx.patchState({
          loading: false,
          error: error.message
        });
        return of(error);
      })
    );
  }

  @Action(RemovePremium)
  removePremium(ctx: StateContext<UserProfileStateModel>) {
    ctx.patchState({ loading: true, error: null });
    
    return this.premiumService.removePremium().pipe(
      tap(() => {
        const identityId = this.store.selectSnapshot(AuthState.identityId);
        const currentUser = UserProfileState.currentUserProfile(ctx.getState(), identityId);
        if (!currentUser) {
          throw new Error('No user profile found');
        }

        const updatedProfile = {
          ...currentUser,
          premiumEnrolledAt: null
        };

        ctx.dispatch(new RemovePremiumSuccess());
        ctx.patchState({
          profilesById: {
            ...ctx.getState().profilesById,
            [currentUser.identityId]: updatedProfile
          },
          loading: false
        });
      }),
      catchError(error => {
        ctx.dispatch(new RemovePremiumFail(error.message));
        ctx.patchState({
          loading: false,
          error: error.message
        });
        return of(error);
      })
    );
  }
}
