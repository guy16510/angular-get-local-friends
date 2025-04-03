import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { CompatibilityService } from '../../services/compatibility.service';
import { tap } from 'rxjs/operators';
import { CompatibilityStateModel } from '../../models/compatibility';
import { 
  GenerateCompatibilityInsights, 
  SetCompatibilityInsights,
  SetCompatibilityLoading,
  SetCompatibilityError
} from '../actions/compatibility.actions';

@State<CompatibilityStateModel>({
  name: 'compatibility',
  defaults: {
    insights: null,
    loading: false,
    error: null
  }
})
@Injectable()
export class CompatibilityState {
  constructor(private compatibilityService: CompatibilityService) {}

  @Selector()
  static insights(state: CompatibilityStateModel) {
    return state.insights;
  }

  @Selector()
  static loading(state: CompatibilityStateModel) {
    return state.loading;
  }

  @Selector()
  static error(state: CompatibilityStateModel) {
    return state.error;
  }

  @Action(GenerateCompatibilityInsights)
  generateInsights(ctx: StateContext<CompatibilityStateModel>, action: GenerateCompatibilityInsights) {
    ctx.dispatch(new SetCompatibilityLoading(true));
    ctx.dispatch(new SetCompatibilityError(null));

    return this.compatibilityService.generateInsights(action.targetUserId).pipe(
      tap({
        next: (insights) => ctx.dispatch(new SetCompatibilityInsights(insights)),
        error: (error) => ctx.dispatch(new SetCompatibilityError(
          error instanceof Error ? error.message : 'Failed to generate compatibility insights'
        ))
      })
    );
  }

  @Action(SetCompatibilityInsights)
  setInsights(ctx: StateContext<CompatibilityStateModel>, action: SetCompatibilityInsights) {
    ctx.patchState({ 
      insights: action.insights,
      loading: false 
    });
  }

  @Action(SetCompatibilityLoading)
  setLoading(ctx: StateContext<CompatibilityStateModel>, action: SetCompatibilityLoading) {
    ctx.patchState({ loading: action.loading });
  }

  @Action(SetCompatibilityError)
  setError(ctx: StateContext<CompatibilityStateModel>, action: SetCompatibilityError) {
    ctx.patchState({ 
      error: action.error,
      loading: false 
    });
  }
} 