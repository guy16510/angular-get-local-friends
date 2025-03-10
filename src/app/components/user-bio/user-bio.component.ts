import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { map, Observable } from 'rxjs';
import { SearchState } from '../../store/states/search.state';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { ImageDisplayComponent } from '../image-display/image-display.component';
// import { UserProfileState } from '../../store/states/user-profile.state';
// import { FetchUserProfile } from '../../store/actions/user-profile.actions';

@Component({
  selector: 'app-user-bio',
  imports: [CommonModule, MaterialModule, ImageDisplayComponent],
  templateUrl: './user-bio.component.html',
  styleUrl: './user-bio.component.css'
})
export class UserBioComponent {
  identityId!: string;
  profile$!: Observable<any>;

  constructor(
    private route: ActivatedRoute,
    private store: Store
  ) {}

  ngOnInit() {
    this.identityId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.identityId) {
      console.error("❌ identityId is missing!");
      return;
    }
    
    // this.profile$ = this.store.select(SearchState.getUserById(this.identityId));
    this.profile$ = this.store.select(SearchState.getUserById).pipe(
      map(getUserByIdFn => getUserByIdFn(this.identityId))
    );
  }
}
