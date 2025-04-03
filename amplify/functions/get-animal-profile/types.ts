// types.ts

export type SurveyAnswerValue = string | string[] | boolean | number;

// Use string keys because JSON keys are always strings at runtime
export interface SurveyAnswers {
  [questionId: string]: SurveyAnswerValue;
}

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

export interface AnimalProfile {
  animal: string;
  adjective: string;
  fullDescription: string;
  traits: Traits;
}

export interface AdjectiveDefinition {
  trait: TraitName;
  min?: number;
  max?: number;
  adjective: string;
}

export interface AnimalDefinition {
  name: string;
  energy: number;
  sociability: number;
  adventurousness: number;
  playfulness: number;
  independence: number;
  nurturance: number;
}

export const TRAIT_THRESHOLDS = {
  HIGH: 70,
  VERY_HIGH: 80,
  LOW: 30,
  VERY_LOW: 20
};