import { State, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';

export interface SurveyStateModel {
  form: {
    model: any;
    dirty: boolean;
    status: string;
    errors: Record<string, any>;
  };
}


@State<SurveyStateModel>({
  name: 'survey',
  defaults: {
    form: {
      model: {},
      dirty: false,
      status: '',
      errors: {}
    }
  }
})
@Injectable()
export class SurveyState {
}