export class EnrollPremium {
  static readonly type = '[Premium] Enroll';
}

export class EnrollPremiumSuccess {
  static readonly type = '[Premium] Enroll Success';
}

export class EnrollPremiumFail {
  static readonly type = '[Premium] Enroll Fail';
  constructor(public error: string) {}
}

export class RemovePremium {
  static readonly type = '[Premium] Remove';
}

export class RemovePremiumSuccess {
  static readonly type = '[Premium] Remove Success';
}

export class RemovePremiumFail {
  static readonly type = '[Premium] Remove Fail';
  constructor(public error: string) {}
} 