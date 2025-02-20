export interface Question {
  id: number;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'fill-in-the-blank';
  component: string;      // "radio", "checkbox", "button-toggle", "input"
  multiSelect?: boolean;  // Indicates if multiple choices are allowed
  options?: string[];     // For multiple-choice questions
}
