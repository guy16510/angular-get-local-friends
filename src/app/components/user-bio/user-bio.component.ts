import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngxs/store';
import { map, Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../utils/material.module';
import { ImageDisplayComponent } from '../image-display/image-display.component';
import { LoadUserProfile } from '../../store/actions/user-profile.actions';
import { UserProfileState } from '../../store/states/user-profile.state';
import { CompatibilityState } from '../../store/states/compatibility.state';
import { GenerateCompatibilityInsights } from '../../store/actions/compatibility.actions';
import { ChartD3Component } from '../shared/chart/chart-d3.component';
// Import the interface
import { CompatibilityInsights } from '../../models/compatibility-insights.model';
import { AuthState } from '../../store/states/auth.state';

@Component({
  selector: 'app-user-bio',
  imports: [
    CommonModule,
    MaterialModule,
    ImageDisplayComponent,
    RouterModule,
    ChartD3Component
  ],
  templateUrl: './user-bio.component.html',
  styleUrls: ['./user-bio.component.scss']
})
export class UserBioComponent implements OnInit, OnDestroy {
  identityId: string = '';
  profile$!: Observable<any>;
  conversationId: string = '';
  currentUserId: string = '';
  isPremiumUser: boolean = false;

  // Type the observable to allow null until data is available.
  compatibilityInsights$: Observable<CompatibilityInsights | null> =
    this.store.select(CompatibilityState.insights);
  loading$ = this.store.select(CompatibilityState.loading);
  error$ = this.store.select(CompatibilityState.error);

  // Data arrays for the standard chart used for insights.
  insightsData: number[] = [];
  insightsLabels: string[] = [];
  private subscription!: Subscription;

  // Store the latest insights value here.
  latestInsights: CompatibilityInsights | null = null;

  // Static preview data for charts.
  previewData = {
    overallCompatibility: {
      data: [80, 20],
      labels: ['Match', 'Mismatch']
    },
    categoryBreakdown: {
      data: [70, 85, 60, 90],
      labels: ['Friendship', 'Interests', 'Communication', 'Lifestyle']
    },
    compatibilityRadar: {
      data: [75, 80, 65, 90, 85],
      labels: ['Friendship', 'Career', 'Social', 'Communication', 'Interests']
    },
    matchAnalysis: {
      data: [50, 60, 70, 80],
      labels: ['Q1', 'Q2', 'Q3', 'Q4']
    },
    personalityTraits: {
      data: [85, 90, 70],
      labels: ['Openness', 'Conscientiousness', 'Agreeableness']
    },
    interestOverlap: {
      data: [60, 40],
      labels: ['Shared', 'Unique']
    },
    communicationStyle: {
      data: [80, 70, 75, 60],
      labels: ['Verbal', 'Text', 'Visual', 'Listening']
    },
    growthPotential: {
      data: [65, 75, 85],
      labels: ['Early', 'Mid', 'Late']
    }
  };

  constructor(private route: ActivatedRoute, private store: Store, private router: Router) {}

  ngOnInit(): void {
    this.identityId = this.route.snapshot.paramMap.get('id') || '';
    this.currentUserId = this.store.selectSnapshot(AuthState.identityId) || '';
    // Uncomment or update when ready:
    // this.isPremiumUser = this.store.selectSnapshot(AuthState.user)?.isPremium || false;
    this.isPremiumUser = true;

    this.store.dispatch(new LoadUserProfile(this.identityId));
    this.profile$ = this.store.select(UserProfileState.getProfileById).pipe(
      map(getById => getById(this.identityId))
    );
    this.conversationId = this.getConversationId(this.identityId, this.currentUserId);

    if (this.isPremiumUser) {
      this.store.dispatch(new GenerateCompatibilityInsights(this.identityId));
    }

    // Subscribe to insights and extract data for charts.
    this.subscription = this.compatibilityInsights$.subscribe((insights) => {
      this.latestInsights = insights; // store the latest value.
      if (insights && insights.categoryMatches) {
        try {
          const categories = insights.categoryMatches.map((match: any) =>
            typeof match === 'string' ? JSON.parse(match) : match
          );
          this.insightsData = categories.map((cat: any) => cat.percentage);
          this.insightsLabels = categories.map((cat: any) =>
            cat.category.replace(/ (preferences|& Dealbreakers)/gi, '').trim()
          );
        } catch (error) {
          console.error('Error parsing compatibility insights:', error);
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getConversationId(userId1: string, userId2: string): string {
    const [participantA, participantB] = [userId1, userId2].sort();
    return `${participantA}#${participantB}`;
  }

  getBioFromSurvey(answers: any[]): string {
    return answers['91'] || 'No bio provided yet.';
  }

  getLikesFromSurvey(answers: Record<number, string | string[] | boolean | number>): string[] {
    const interestingQs = [16, 17, 14, 60, 70];
    const likes: string[] = [];
    for (const qId of interestingQs) {
      const entry = answers[qId];
      if (entry !== undefined) {
        if (Array.isArray(entry)) {
          likes.push(...entry.filter((item: any) => typeof item === 'string'));
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

  // Compute overall match from insightsData.
  get overallMatch(): number {
    return this.insightsData && this.insightsData.length
      ? this.insightsData.reduce((a, b) => a + b, 0) / this.insightsData.length
      : 0;
  }

  // Use the stored latestInsights instead of re-subscribing.
  get topCategory(): { percentage: number } | null {
    if (this.latestInsights &&
        this.latestInsights.categoryMatches &&
        this.latestInsights.categoryMatches.length) {
      const categories = this.latestInsights.categoryMatches.map((match: any) =>
        typeof match === 'string' ? JSON.parse(match) : match
      );
      return categories.reduce((prev: any, curr: any) =>
        curr.percentage > prev.percentage ? curr : prev
      );
    }
    return null;
  }

  get lowestCategory(): { percentage: number } | null {
    if (this.latestInsights &&
        this.latestInsights.categoryMatches &&
        this.latestInsights.categoryMatches.length) {
      const categories = this.latestInsights.categoryMatches.map((match: any) =>
        typeof match === 'string' ? JSON.parse(match) : match
      );
      return categories.reduce((prev: any, curr: any) =>
        curr.percentage < prev.percentage ? curr : prev
      );
    }
    return null;
  }
}