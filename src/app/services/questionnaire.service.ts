// questionnaire.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SURVEY_QUESTIONS } from '../data/surveyQuestions';
import { SurveyQuestion } from '../models/question';

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireService {
  constructor() { }

  getQuestions(): Observable<SurveyQuestion[]> {
    return of(SURVEY_QUESTIONS);
  }
}