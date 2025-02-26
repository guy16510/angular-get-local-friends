export type QuestionType = 'multiple-choice' | 'multiple-select' | 'true-false' | 'fill-in' | 'sliding-scale';

export interface SurveyQuestion {
  id: number;
  category: string;
  question: string;
  type: QuestionType;
  options?: string[];
  scale?: { min: number; max: number };
}