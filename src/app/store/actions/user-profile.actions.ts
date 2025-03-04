import {UserProfile} from '../../models/user-profile.model';

export class SubmitUserProfile {
  static readonly type = '[User Profile] Submit';
  constructor(public payload: UserProfile) {}
}