export class GenerateCompatibilityInsights {
  static readonly type = '[Compatibility] Generate Insights';
  constructor(public targetUserId: string) {}
}

export class SetCompatibilityInsights {
  static readonly type = '[Compatibility] Set Insights';
  constructor(public insights: any) {}
}

export class SetCompatibilityLoading {
  static readonly type = '[Compatibility] Set Loading';
  constructor(public loading: boolean) {}
}

export class SetCompatibilityError {
  static readonly type = '[Compatibility] Set Error';
  constructor(public error: string | null) {}
} 