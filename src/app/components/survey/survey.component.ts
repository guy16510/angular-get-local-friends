import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { SURVEY_QUESTIONS, SurveyQuestion } from '../../data/surveyQuestions';
import { MaterialModule } from '../../utils/material.module';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxsFormDirective } from '@ngxs/form-plugin';
import { Store } from '@ngxs/store';
import { SetProgress } from '../../store/actions/progress.actions';
import { ProgressState } from '../../store/states/progress.state';
import { ProgressBarComponent } from "../shared/progress-bar/progress-bar.component";
// import {SaveSurveyAnswers} from '../../store/actions/survey.actions';

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
    imports: [MaterialModule, CommonModule, ReactiveFormsModule, NgxsFormDirective, ProgressBarComponent]
})
export class SurveyComponent implements OnInit {
  surveyForm!: FormGroup;
  questions: SurveyQuestion[] = SURVEY_QUESTIONS;
  currentPage = 0;
  pageSize = 10;
  scaleRange: number[] = [];
  showProgressBar: boolean = true;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0 });
  
    // Restore currentPage from the state
    const savedCurrentPage = this.store.selectSnapshot(ProgressState.currentPage);
    if (savedCurrentPage !== undefined) {
      this.currentPage = typeof savedCurrentPage === 'number' ? savedCurrentPage : 0;
    }
  
    this.updateProgress(); // Update progress based on restored currentPage
  
    // Generate the scale range for sliding-scale (replaced with radio buttons 1-10)
    this.scaleRange = Array.from({ length: 5 }, (_, i) => i + 1);
  
    // Build a form control for each question (using question.id as key)
    const formGroupConfig: { [key: string]: any } = {};
    for (const question of this.questions) {
      const key = question.id.toString();
      if (question.type === 'multiple-select') {
        formGroupConfig[key] = new FormControl([], minLengthArray(1));
      } else {
        formGroupConfig[key] = new FormControl(null, Validators.required);
      }
    }
    this.surveyForm = this.fb.group(formGroupConfig);
  
    // Use Promise.resolve().then to ensure this runs after the current change detection cycle
    Promise.resolve().then(() => {
      this.updateProgress();
      this.restoreCurrentPage();
    });
  }
  

  private updateProgress(): void {
    const progress = this.progress;
    this.store.dispatch(new SetProgress(progress, this.currentPage)); // Dispatch progress and currentPage
  }

  /**
   * Computes the appropriate currentPage based on saved answers.
   * It iterates through pages and finds the first page where not all questions have been answered.
   * If all pages are complete, it sets the currentPage to the last page.
   */
  private restoreCurrentPage(): void {
    const totalPages = this.totalPages;
  
    // Iterate through pages to find the first incomplete page
    for (let i = 0; i < totalPages; i++) {
      const start = i * this.pageSize;
      const pageQuestions = this.questions.slice(start, start + this.pageSize);
  
      // Check if every control on this page has a non-null value
      const allAnswered = pageQuestions.every(q => {
        const control = this.surveyForm.get(q.id.toString());
        if (!control) return false;
        if (Array.isArray(control.value)) {
          return control.value.length > 0;
        }
        return control.value !== null && control.value !== undefined;
      });
  
      if (!allAnswered) {
        this.currentPage = i; // Set currentPage to the first incomplete page
        return;
      }
    }
  
    // If all pages are complete, default to the last page
    this.currentPage = totalPages - 1;
  }

  // Returns the questions for the current page.
  get paginatedQuestions(): SurveyQuestion[] {
    const start = this.currentPage * this.pageSize;
    return this.questions.slice(start, start + this.pageSize);
  }

  // Calculates the overall progress percentage.
  get progress(): number {
    console.log(this.currentPage)
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
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.updateProgress(); 
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updateProgress(); 
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  isLastPage(): boolean {
    return (this.currentPage + 1) >= this.totalPages;
  }


  async onSubmit(): Promise<void> {
    if (this.surveyForm.valid) {
      this.router.navigate(['/account-setup']);
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