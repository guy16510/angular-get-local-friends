import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { SubmitUserProfile } from '../actions/user-profile.actions';
import { UserProfile, UserProfileStateModel } from '../../models/user-profile.model';
import { UserProfileService } from '../../services/user-profile.service';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { UpdateUserOnlineStatus } from '../actions/user-profile.actions';
import { AuthState } from './auth.state';

@State<UserProfileStateModel>({
  name: 'userProfile',
  defaults: {
    profile: null,
    loading: false,
    error: null,
  }
})
@Injectable()
export class UserProfileState {

  constructor(
    private userProfileService: UserProfileService,
    private store: Store
  ) {}

  @Selector()
  static profile(state: UserProfileStateModel): UserProfile | null {
    return state?.profile || null;
  }

  @Selector()
  static loading(state: UserProfileStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static error(state: UserProfileStateModel): string | null {
    return state.error;
  }

  @Selector()
  static lastOnlineAt(state: UserProfileStateModel): string | null {
    return state.profile?.lastOnlineAt || null;
  }

  @Action(SubmitUserProfile)
  submitUserProfile(ctx: StateContext<UserProfileStateModel>, action: SubmitUserProfile) {
    // Set loading true and clear any previous error
    ctx.patchState({ loading: true, error: null });

    return this.userProfileService.submitUserProfile(action.payload).pipe(
      tap((result: UserProfile) => {
        debugger;
        // Ensure surveyAnswers is correctly structured
        //TODO this is the response: "UserProfile for us-east-1:660f914c-c773-ca1c-3919-26f3b4f97eb2 created successfully."
        const formattedProfile: UserProfile = {
          ...result,
          surveyAnswers: result.surveyAnswers.map(answer => ({
            questionId: Number(answer.questionId),
            answer: answer.answer
          }))
        };

        // On success, update the profile state with the API response
        ctx.patchState({
          profile: formattedProfile,
          loading: false,
          error: null
        });
      }),
      catchError(error => {
        const errorMessage = error instanceof Error ? error.message : 'Failed to submit profile';
        ctx.patchState({ loading: false, error: errorMessage });
        // Return an observable so the action completes gracefully.
        return of(null);
      })
    );
  }

  @Action(UpdateUserOnlineStatus)
  updateOnlineStatus(ctx: StateContext<UserProfileStateModel>) {
    const identityId = this.store.selectSnapshot(AuthState.identityId);
    if (!identityId) {
      console.warn('[UserProfileState] No identityId found — skipping online status update.');
      return;
    }
  
    const now = new Date().toISOString();
    const state = ctx.getState();
  
    // Optimistic update, only if profile is populated
    if (state.profile) {
      ctx.patchState({
        profile: {
          ...state.profile,
          lastOnlineAt: now
        }
      });
    }
  
    return this.userProfileService.updateUserOnlineStatus(identityId);
  }

}