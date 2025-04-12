export interface CompatibilityInsights {
    categoryMatches: Array<
      | string
      | {
          category: string;
          matches: number;
          total: number;
          percentage: number;
        }
    >;
    overallPercentage: number;
    totalMatches: number;
    totalQuestions: number;
    createdAt?: string;  // Marked optional
    updatedAt?: string;  // Marked optional
  }

export interface CompatibilityStateModel {
  insights: CompatibilityInsights | null;
  loading: boolean;
  error: string | null;
} 