import { Selector } from '@ngxs/store';
import { ProgressStateModel, ProgressState } from '../states/progress.state';

export class ProgressSelectors {
  @Selector([ProgressState])
  static getProgress(state: ProgressStateModel): number {
    return state.progress;
  }
}