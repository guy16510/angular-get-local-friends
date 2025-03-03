export interface UserProfile {
    identityId: string;
    locationLat: number;
    locationLng: number;
    surveyQuestions: { [key: string]: string | string[] };
  }
  
export interface UserProfileStateModel {
    profile: UserProfile | null;
    loading: boolean;
    error: string | null;
}