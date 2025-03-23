export interface AnimalProfile {
  animal: string;
  adjective: string;
  traits: {
    sociability: number;
    adventurousness: number;
    independence: number;
    nurturance: number;
    playfulness: number;
    energy: number;
  };
  fullDescription: string;
}

export interface UserProfile {
  identityId: string;
  locationLat: number;
  locationLng: number;
  userName: string;
  surveyAnswers: {
    questionId: number;
    answer: string;
  }[];
  lastOnlineAt?: string;
  selfProfile?: AnimalProfile;      // Corrected to AnimalProfile
  seekingProfile?: AnimalProfile;   // Corrected to AnimalProfile
  animalProfileLoadedAt?: string;
}
export interface UserProfileStateModel {
    profile: UserProfile | null;
    loading: boolean;
    error: string | null;
}