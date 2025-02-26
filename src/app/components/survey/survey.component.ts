import { Component, OnInit } from '@angular/core';
import { SURVEY_QUESTIONS, SurveyQuestion } from '../../data/surveyQuestions';
import { MaterialModule } from '../../shared/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ProgressBarComponent } from '../shared/progress-bar/progress-bar.component';

/**
 * Custom validator for multiple-select questions.
 * Requires the array to have at least one entry.
 */
export function minLengthArray(min: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (Array.isArray(control.value) && control.value.length >= min) {
      return null;
    }
    return { minLengthArray: { valid: false } };
  };
}

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.css'],
  imports: [MaterialModule, CommonModule, ReactiveFormsModule, ProgressBarComponent],
  standalone: true
})
export class SurveyComponent implements OnInit {
  surveyForm!: FormGroup;
  questions: SurveyQuestion[] = SURVEY_QUESTIONS;
  currentPage = 0;
  pageSize = 10;
  scaleRange: number[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Generate the scale range for sliding-scale (replaced with radio buttons 1-10)
    this.scaleRange = Array.from({ length: 10 }, (_, i) => i + 1);

    // Build a form control for each question (using question.id as key)
    const formGroupConfig: { [key: string]: any } = {};
    for (const question of this.questions) {
      const key = question.id.toString();
      if (question.type === 'multiple-select') {
        // For checkboxes, initialize as an empty array and require at least one selection.
        formGroupConfig[key] = new FormControl([], minLengthArray(1));
      } else {
        formGroupConfig[key] = new FormControl(null, Validators.required);
      }
    }
    this.surveyForm = this.fb.group(formGroupConfig);
  }

  // Returns the questions for the current page.
  get paginatedQuestions(): SurveyQuestion[] {
    const start = this.currentPage * this.pageSize;
    return this.questions.slice(start, start + this.pageSize);
  }

  // Calculates the overall progress percentage.
  get progress(): number {
    return ((this.currentPage + 1) / this.totalPages) * 100;
  }

  get totalPages(): number {
    return Math.ceil(this.questions.length / this.pageSize);
  }

  // Checks if all questions on the current page are valid.
  arePageQuestionsValid(): boolean {
    for (const question of this.paginatedQuestions) {
      const control = this.surveyForm.get(question.id.toString());
      if (control && control.invalid) {
        return false;
      }
    }
    return true;
  }

  nextPage(): void {
    if (!this.isLastPage() && this.arePageQuestionsValid()) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  isLastPage(): boolean {
    return (this.currentPage + 1) >= this.totalPages;
  }

  onSubmit(): void {
    if (this.surveyForm.valid) {
      console.log("Form submitted!", this.surveyForm.value);
      // Here you can dispatch your state management action or call an API.
    }
  }

  // For handling multiple-select questions manually.
  isChecked(questionId: number, option: string): boolean {
    const control = this.surveyForm.get(questionId.toString());
    if (control && Array.isArray(control.value)) {
      return control.value.includes(option);
    }
    return false;
  }

  toggleSelection(questionId: number, option: string): void {
    const control = this.surveyForm.get(questionId.toString());
    if (control && Array.isArray(control.value)) {
      const currentValue = control.value as string[];
      if (currentValue.includes(option)) {
        control.setValue(currentValue.filter(item => item !== option));
      } else {
        control.setValue([...currentValue, option]);
      }
      control.updateValueAndValidity();
    }
  }
}