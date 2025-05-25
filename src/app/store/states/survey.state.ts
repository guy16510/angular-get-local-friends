import { State, Selector, Action, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { SaveSurveyAnswers } from '../actions/survey.actions';

export interface SurveyStateModel {
  form: {
    model: any;
    dirty: boolean;
    status: string;
    errors: Record<string, any>;
  };
  answers: { [key: string]: any };
}

@State<SurveyStateModel>({
  name: 'survey',
  defaults: {
    form: {
      model: {},
      dirty: false,
      status: '',
      errors: {}
    },
    answers: {}
  }
})
@Injectable()
export class SurveyState {
  @Selector()
  static getSurveyAnswers(state: SurveyStateModel) {
    return state.answers;
  }

  @Action(SaveSurveyAnswers)
  saveSurveyAnswers(ctx: StateContext<SurveyStateModel>, action: SaveSurveyAnswers) {
    const state = ctx.getState();
    ctx.patchState({
      answers: action.payload
    });
  }
}