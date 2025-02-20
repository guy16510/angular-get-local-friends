// questionnaire.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { surveyQuestions } from '../data/surveyQuestions';
import { Question } from '../models/question';

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireService {
  constructor() { }

  getQuestions(): Observable<Question[]> {
    return of(surveyQuestions);
  }
}