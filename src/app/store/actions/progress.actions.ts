export class SetProgress {
  static readonly type = '[Progress] Set Progress';
  constructor(public progress: number, public currentPage: number) {} // Include currentPage
}