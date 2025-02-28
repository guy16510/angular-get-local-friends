// survey.state.ts
import { State } from '@ngxs/store';
import { Injectable } from '@angular/core';

export interface SurveyStateModel {
  surveyForm: {
    model: { [key: string]: any };
    dirty: boolean;
    status: string;
    errors: any;
  };
}

@State<SurveyStateModel>({
  name: 'survey',
  defaults: {
    surveyForm: {
      model: {}, // Initially, no answers
      dirty: false,
      status: '',
      errors: {}
    }
  }
})
@Injectable()
export class SurveyState {}