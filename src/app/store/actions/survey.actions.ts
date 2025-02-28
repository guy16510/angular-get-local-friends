export class SaveAnswer {
  static readonly type = '[Survey] Save Answer';
  constructor(public payload: Record<number, any>) {} // Now takes an object of answers
}

export class ResetSurvey {
  static readonly type = '[Survey] Reset Survey';
}
