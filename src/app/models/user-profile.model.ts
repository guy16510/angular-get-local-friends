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

export interface DeepProfileInsights {
  personalityNarrative: string;
  socialRole: string;
  friendshipNeeds: string;
  potentialGrowthPath: string;
  compatibilityTip: string;
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
  selfProfile?: AnimalProfile;
  seekingProfile?: AnimalProfile;
  deepInsights?: DeepProfileInsights;
  animalProfileLoadedAt?: string;
}

export interface UserProfileStateModel {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}