import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngxs/store';
import { map, Observable } from 'rxjs';
import { SearchState } from '../../store/states/search.state';
import { AuthState } from '../../store/states/auth.state';
import { SurveyState } from '../../store/states/survey.state';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../utils/material.module';
import { ImageDisplayComponent } from '../image-display/image-display.component';
import { LoadUserProfile } from '../../store/actions/user-profile.actions';
import { UserProfileState } from '../../store/states/user-profile.state';
import { CompatibilityState } from '../../store/states/compatibility.state';
import { GenerateCompatibilityInsights } from '../../store/actions/compatibility.actions';

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
  isPremiumUser: boolean = false;
  compatibilityInsights$ = this.store.select(CompatibilityState.insights);
  loading$ = this.store.select(CompatibilityState.loading);
  error$ = this.store.select(CompatibilityState.error);

  constructor(private route: ActivatedRoute, private store: Store, private router: Router) {}

  ngOnInit(): void {
    this.identityId = this.route.snapshot.paramMap.get('id') || '';
    this.currentUserId = this.store.selectSnapshot(AuthState.identityId) || '';
    // this.isPremiumUser = this.store.selectSnapshot(AuthState.user)?.isPremium || false; //TODO
    this.isPremiumUser = true;


    this.store.dispatch(new LoadUserProfile(this.identityId));
    this.profile$ = this.store.select(UserProfileState.getProfileById).pipe(
      map(getById => getById(this.identityId))
    );
    
    this.conversationId = this.getConversationId(this.identityId, this.currentUserId);

    if (this.isPremiumUser) {
      this.store.dispatch(new GenerateCompatibilityInsights(this.identityId));
    }
  }

  // generateCompatibilityInsights() {
  //   if (this.isPremiumUser) {
  //     this.store.dispatch(new GenerateCompatibilityInsights(this.identityId));
  //   }
  // }

  getConversationId(userId1: string, userId2: string): string {
    const [participantA, participantB] = [userId1, userId2].sort();
    return `${participantA}#${participantB}`;
  }

  getBioFromSurvey(answers: any[]): string {
    return answers['91'] || 'No bio provided yet.';
  }

  /**
   * TODO move this to the API.. I will not have the answers being sent back soon.
   */
  getLikesFromSurvey(answers: Record<number, string | string[] | boolean | number>): string[] {
    const interestingQs = [16, 17, 14, 60, 70];
    const likes: string[] = [];
    for (const qId of interestingQs) {
      const entry = answers[qId];
      if (entry !== undefined) {
        if (Array.isArray(entry)) {
          // Ensure only strings are added
          likes.push(...entry.filter(item => typeof item === 'string') as string[]);
        } else if (typeof entry === 'string') {
          likes.push(entry);
        }
      }
    }
    return likes.slice(0, 6);
  }

  promptUpgrade(): void {
    this.router.navigate(['/premium-upgrade']);
  }
}