import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { SearchState } from '../../store/states/search.state';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { ImageDisplayComponent } from '../image-display/image-display.component';

@Component({
  selector: 'app-user-bio',
  imports: [CommonModule, MaterialModule, ImageDisplayComponent, RouterModule],
  templateUrl: './user-bio.component.html',
  styleUrl: './user-bio.component.scss'
})
export class UserBioComponent {
  identityId: string = '';
  profile$!: Observable<any>;

  constructor(private route: ActivatedRoute, private store: Store) {}

  ngOnInit(): void {
    this.identityId = this.route.snapshot.paramMap.get('id') || '';
    const allUsers = this.store.selectSnapshot(SearchState.nearbyUsers);
    const user = allUsers.find(u => u.identityId === this.identityId);
    this.profile$ = new Observable(observer => observer.next(user));
  }

  getBioFromSurvey(answers: any[]): string {
    const bio = answers?.find(a => a.questionId === 91);
    return bio?.answer || 'No bio provided yet.';
  }

  getLikesFromSurvey(answers: any[]): string[] {
    const interestingQs = [16, 17, 14, 60, 70]; // Interests, Events, Activities, Music, Fitness
    const likes = [];

    for (let qId of interestingQs) {
      const entry = answers.find(ans => ans.questionId === qId);
      if (entry) {
        if (Array.isArray(entry.answer)) likes.push(...entry.answer);
        else if (typeof entry.answer === 'string') likes.push(entry.answer);
      }
    }
    return likes.slice(0, 6); // Limit to 6 items for UI cleanliness
  }
}