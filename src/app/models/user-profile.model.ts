export interface UserProfile {
    identityId: string;
    locationLat: number;
    locationLng: number;
    surveyQuestions: { [key: string]: string | string[] };
  }
  