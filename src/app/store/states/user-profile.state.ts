import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { SubmitUserProfile } from '../actions/user-profile.actions';
import { UserProfile, UserProfileStateModel } from '../../models/user-profile.model';
import { UserProfileService } from '../../services/user-profile.service';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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

  constructor(private userProfileService: UserProfileService) {}

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

  @Action(SubmitUserProfile)
  submitUserProfile(ctx: StateContext<UserProfileStateModel>, action: SubmitUserProfile) {
    // Set loading true and clear any previous error
    ctx.patchState({ loading: true, error: null });
    debugger;

    return this.userProfileService.submitUserProfile(action.payload).pipe(
      tap((result: UserProfile) => {
        // Ensure surveyAnswers is correctly structured
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
}
