import {UserProfile} from '../../models/user-profile.model';

export class SubmitUserProfile {
  static readonly type = '[User Profile] Submit';
  constructor(public payload: UserProfile) {}
}

export class UpdateUserOnlineStatus {
  static readonly type = '[UserProfile] Update Online Status';
}