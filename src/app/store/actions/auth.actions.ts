// auth.actions.ts
export class CheckAuth {
  static readonly type = '[Auth] Check';
}

export class Login {
  static readonly type = '[Auth] Login';
  constructor(public username: string, public password: string) {}
}

export class Logout {
  static readonly type = '[Auth] Logout';
}

export class FetchIdentityId {
  static readonly type = '[Auth] Fetch Identity ID';
}

export class SetAuthenticatedUser {
  static readonly type = '[Auth] Set Authenticated User';
  constructor(public user: any) {}
}