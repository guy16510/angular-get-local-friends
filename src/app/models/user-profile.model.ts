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

  // New extracted traits
  ageRange?: string;
  desiredFriendAgeRanges?: string[];
  gender?: string;
  genderFriendPreference?: string;
  hasKids?: boolean;
  wantsFriendsWithKids?: boolean;
  childAgeGroups?: string[];
  wantsSimilarChildAges?: boolean;

  // Raw answers (for recomputation)
  surveyAnswers: {
    questionId: number;
    answer: string | string[] | boolean;
  }[];

  // Profile metadata
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