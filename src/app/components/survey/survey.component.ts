// survey.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { QuestionnaireService } from '../../services/questionnaire.service';
import { Question } from '../../models/question';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  standalone: true,
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.css'],
  imports: [   
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatProgressBarModule,
    MatCard,
    MatCardContent,
    MatCheckboxModule
  ]
})
export class SurveyComponent implements OnInit {
  questions: Question[] = [];
  steps: Question[][] = [];
  surveyForm!: FormGroup;
  currentStep = 0;
  stepSize = 10; // 10 questions per step

  constructor(
    private questionnaireService: QuestionnaireService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.questionnaireService.getQuestions().subscribe((qs) => {
      this.questions = qs;
      this.groupQuestionsIntoSteps();
      this.buildForm();
    });
  }

  groupQuestionsIntoSteps(): void {
    for (let i = 0; i < this.questions.length; i += this.stepSize) {
      this.steps.push(this.questions.slice(i, i + this.stepSize));
    }
  }

  buildForm(): void {
    const group: { [key: string]: any } = {};
    this.questions.forEach((q) => {
      if (q.type === 'multiple-choice' && q.multiSelect) {
        // Create a FormArray of booleans for each option
        group['q' + q.id] = this.fb.array(
          q.options ? q.options.map(() => this.fb.control(false)) : []
        );
      } else {
        group['q' + q.id] = [''];
      }
    });
    this.surveyForm = this.fb.group(group);
  }

  get progress(): number {
    return ((this.currentStep + 1) / this.steps.length) * 100;
  }
  
  getFormArray(key: string) {
    return this.surveyForm.get(key);
  }

  nextStep(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  onSubmit(): void {
    if (this.surveyForm.valid) {
      console.log('Survey Submitted', this.surveyForm.value);
      // Process the form as needed
    }
  }
}