import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngxs/store';
import { map, Observable } from 'rxjs';
import { SearchState } from '../../store/states/search.state';
import { AuthState } from '../../store/states/auth.state';
import { SurveyState } from '../../store/states/survey.state';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { ImageDisplayComponent } from '../image-display/image-display.component';
import { LoadUserProfile } from '../../store/actions/user-profile.actions';
import { UserProfileState } from '../../store/states/user-profile.state';

@Component({
  selector: 'app-user-bio',
  imports: [CommonModule, MaterialModule, ImageDisplayComponent, RouterModule],
  templateUrl: './user-bio.component.html',
  styleUrl: './user-bio.component.scss'
})
export class UserBioComponent implements OnInit {
  identityId: string = '';
  profile$!: Observable<any>;
  conversationId: string = '';
  currentUserId: string = '';
  isPremiumUser: boolean = false; // Fetch this from user state or subscription state
  compatibilityInsights: string = '';

  constructor(private route: ActivatedRoute, private store: Store) {}

  ngOnInit(): void {
    this.identityId = this.route.snapshot.paramMap.get('id') || '';
    this.currentUserId = this.store.selectSnapshot(AuthState.identityId) || '';
    this.isPremiumUser = this.store.selectSnapshot(AuthState.user)?.isPremium || false;


    /**
     * TODO setup to look up both user and my own profile..
     * Needs to read state, then dispatch it.
     * Then do personality assessment.
     */

    this.store.dispatch(new LoadUserProfile(this.identityId));
    this.profile$ = this.store.select(UserProfileState.getProfileById).pipe(
      map(getById => getById(this.identityId))
    );
    
    this.conversationId = this.getConversationId(this.identityId, this.currentUserId);

    if (this.isPremiumUser) {
      this.generateCompatibilityInsights();
    }
  }

  getConversationId(a: string, b: string): string {
    return [a, b].sort().join('#');
  }

  getBioFromSurvey(answers: any[]): string {
    const bio = answers?.find(a => a.questionId === 91);
    return bio?.answer || 'No bio provided yet.';
  }

  getLikesFromSurvey(answers: any[]): string[] {
    const interestingQs = [16, 17, 14, 60, 70];
    const likes = [];
    for (let qId of interestingQs) {
      const entry = answers.find(ans => ans.questionId === qId);
      if (entry) {
        if (Array.isArray(entry.answer)) likes.push(...entry.answer);
        else if (typeof entry.answer === 'string') likes.push(entry.answer);
      }
    }
    return likes.slice(0, 6);
  }

  generateCompatibilityInsights(): void {

    // const currentUserAnswers = this.store.selectSnapshot(SurveyState.answers);
    let matches = 0;

    // currentUserAnswers.forEach(cuAns => {
    //   const matched = profile.surveyAnswers.some(userAns =>
    //     userAns.questionId === cuAns.questionId && userAns.answer === cuAns.answer
    //   );
    //   if (matched) matches++;
    // });
    this.compatibilityInsights = "hello World";
    // this.compatibilityInsights = `You share ${matches} common interests with ${profile.userName}.`;
  }

  promptUpgrade(): void {
    alert('Upgrade to Premium to unlock personalized compatibility insights!');
  }
}