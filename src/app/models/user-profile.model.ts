export interface UserProfile {
  identityId: string;
  locationLat: number;
  locationLng: number;
  userName: string;
  surveyAnswers: {
      questionId: number;
      answer: string;
  }[];
}

export interface UserProfileStateModel {
    profile: UserProfile | null;
    loading: boolean;
    error: string | null;
}