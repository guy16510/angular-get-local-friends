import { UserProfile } from '../../models/user-profile.model';

export class LoadUserProfile {
  static readonly type = '[UserProfile] Load';
  constructor() {}
}

export class SubmitUserProfile {
  static readonly type = '[UserProfile] Submit';
  constructor(public payload: UserProfile) {}
}

export class LoadUserProfileSuccess {
  static readonly type = '[UserProfile] Load Success';
  constructor(public payload: UserProfile) {}
}

export class LoadUserProfileFail {
  static readonly type = '[UserProfile] Load Fail';
  constructor(public error: any) {}
}

export class UpdateUserOnlineStatus {
  static readonly type = '[UserProfile] Online Ping';
  constructor() {} // No args needed — identityId comes from AuthState
}

export class LoadAnimalProfile {
  static readonly type = '[UserProfile] Load Animal Profile';
  constructor() {}
}

export class LoadAnimalProfileSuccess {
  static readonly type = '[UserProfile] Load Animal Profile Success';
  constructor(public payload: { selfProfile: any; seekingProfile: any }) {}
}

export class LoadAnimalProfileFail {
  static readonly type = '[UserProfile] Load Animal Profile Fail';
  constructor(public error: any) {}
}