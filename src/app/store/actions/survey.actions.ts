export class SaveSurveyAnswers {
  static readonly type = '[Survey] Save Answers';
  constructor(public payload: any) {} // Store the entire survey form object
}

export class SetProgress {
  static readonly type = '[Progress] Set Progress';
  constructor(public progress: number) {}
}