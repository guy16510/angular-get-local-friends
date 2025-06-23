import { State, Action, StateContext, Selector } from '@ngxs/store';
import { SetProgress } from '../actions/progress.actions';

export interface ProgressStateModel {
  progress: number;
  currentPage: number; // Add currentPage to the state
}

@State<ProgressStateModel>({
  name: 'progress',
  defaults: {
    progress: 0, // Default progress value
    currentPage: 0 // Default currentPage value
  }
})
export class ProgressState {
  @Selector()
  static progress(state: ProgressStateModel): number {
    return state.progress; // Selector to retrieve progress value
  }

  @Selector()
  static currentPage(state: ProgressStateModel): number {
    return state.currentPage; // Selector to retrieve currentPage value
  }

  @Action(SetProgress)
  setProgress(ctx: StateContext<ProgressStateModel>, action: SetProgress) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      progress: action.progress,
      currentPage: action.currentPage // Update currentPage in the state
    });
  }
}