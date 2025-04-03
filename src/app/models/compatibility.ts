export interface CompatibilityInsights {
  totalMatches: number;
  totalQuestions: number;
  overallPercentage: number;
  categoryMatches: Array<{
    category: string;
    matches: number;
    total: number;
    percentage: number;
  }>;
}

export interface CompatibilityStateModel {
  insights: CompatibilityInsights | null;
  loading: boolean;
  error: string | null;
} 