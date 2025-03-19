// types.ts

export type SurveyAnswerValue = string | string[] | boolean | number;

export interface SurveyAnswers {
    [questionId: number]: SurveyAnswerValue;
}

// Trait constants for type safety
export const TRAITS = {
    ENERGY: 'energy',
    SOCIABILITY: 'sociability',
    ADVENTUROUSNESS: 'adventurousness',
    PLAYFULNESS: 'playfulness',
    INDEPENDENCE: 'independence',
    NURTURANCE: 'nurturance'
} as const;

export type TraitName = typeof TRAITS[keyof typeof TRAITS];

export interface Traits {
    [TRAITS.ENERGY]: number;
    [TRAITS.SOCIABILITY]: number;
    [TRAITS.ADVENTUROUSNESS]: number;
    [TRAITS.PLAYFULNESS]: number;
    [TRAITS.INDEPENDENCE]: number;
    [TRAITS.NURTURANCE]: number;
}

// Profile type for both self and desired friends
export interface AnimalProfile {
    animal: string;
    adjective: string;
    fullDescription: string;
    traits: Traits;
}

// Adjective definition for selecting profile adjectives
export interface AdjectiveDefinition {
    trait: TraitName;
    min?: number;
    max?: number;
    adjective: string;
}

// Animal definition for the database
export interface AnimalDefinition {
    name: string;
    energy: number;
    sociability: number;
    adventurousness: number;
    playfulness: number;
    independence: number;
    nurturance: number;
}

// Constants for trait thresholds
export const TRAIT_THRESHOLDS = {
    HIGH: 70,
    VERY_HIGH: 80,
    LOW: 30,
    VERY_LOW: 20
};
