import { State, Action, StateContext } from '@ngxs/store';
import { SetProgress } from '../actions/progress.actions';

export interface ProgressStateModel {
  progress: number;
}

@State<ProgressStateModel>({
  name: 'progress',
  defaults: {
    progress: 0
  }
})
export class ProgressState {
  @Action(SetProgress)
  setProgress(ctx: StateContext<ProgressStateModel>, action: SetProgress) {
    ctx.setState({ progress: action.progress });
  }
}