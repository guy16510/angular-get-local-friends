import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Store } from '@ngxs/store';
import { SearchNearbyUsers, SearchUsers, SetSearchFilters, SearchPremiumUsers } from '../../store/actions/search.actions';
import { SearchState } from '../../store/states/search.state';
import { GeolocationState } from '../../store/states/geolocation.state';
import { FetchPreciseLocation, FetchIPLocation } from '../../store/actions/geolocation.action';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../utils/material.module';
import { ImageDisplayComponent } from '../image-display/image-display.component';
import { LoadingComponent } from '../shared/loading/loading.component';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { User } from '../../models/user.model';
import { AuthState } from '../../store/states/auth.state';
import { UserProfileState } from '../../store/states/user-profile.state';
import { LoadUserProfile } from '../../store/actions/user-profile.actions';
import { UserProfile } from '../../models/user-profile.model';
import { UserProfileFacade } from '../../facades/user-profile.facade';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  imports: [
    CommonModule,
    MaterialModule,
    ImageDisplayComponent,
    LoadingComponent,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatGridListModule,
    MatMenuModule,
    MatExpansionModule
  ],
  standalone: true
})
export class SearchComponent implements OnInit, OnDestroy {
  users$: Observable<User[]> = this.store.select(state => state.search.nearbyUsers);
  loading$: Observable<boolean> = this.store.select(state => state.search.loading);
  error$: Observable<string | null> = this.store.select(state => state.search.error);
  hasMore$: Observable<boolean> = this.store.select(state => state.search.hasMore);
  currentPage$: Observable<number> = this.store.select(state => state.search.currentPage);
  totalPages$: Observable<number> = this.store.select(state => state.search.totalPages);
  isPremium$: Observable<boolean> = this.store.select(UserProfileState.isPremium);
  userProfile$!: Observable<UserProfile | null>;

  
  // Geolocation state selectors
  location$: Observable<{ lat: number | null; lng: number | null; city: string | null }> = this.store.select(GeolocationState.location);
  geoLoading$: Observable<boolean> = this.store.select(GeolocationState.loading);
  geoError$: Observable<string | null> = this.store.select(GeolocationState.error);

  hasSearched = false;
  isLoading = false;
  radius = 10;
  sortBy = 'distance';
  gender: string | null = null;
  hasKids: boolean | null = null;
  ageRange = {
    min: 18,
    max: 100
  };
  private destroy$ = new Subject<void>();

  lat!: number;
  lng!: number;
  city: string | null = null;
  radiusOptions = [5, 10, 15, 25, 50];
  paginationTokens: (string | null)[] = [null];
  currentPage: number = 0;
  hasMoreResults: boolean = false;
  
  cols: number = 3;

  constructor(private store: Store, private router: Router, private userProfileFacade: UserProfileFacade) {}

  async ngOnInit() {
    // ensure user has completed the survey.
    this.userProfile$ = this.userProfileFacade.getCurrentUserProfile();

    // Try to get precise location first
    await this.store.dispatch(new FetchPreciseLocation()).toPromise();
    
    // If precise location failed, fallback to IP location
    const location = this.store.selectSnapshot(GeolocationState.location);
    if (!location.lat || !location.lng) {
      await this.store.dispatch(new FetchIPLocation()).toPromise();
    }


    // Get the final location state
    const finalLocation = this.store.selectSnapshot(GeolocationState.location);
    this.lat = finalLocation.lat!;
    this.lng = finalLocation.lng!;
    this.city = finalLocation.city;
  }

  ngOnDestroy() {
  }

  isOnline(lastOnlineAt: string) {
    if (lastOnlineAt) {
      return Date.now() - new Date(lastOnlineAt).getTime() < 5 * 60 * 1000;
    }
    return false;
  }

  searchUsers(pageIndex = 0) {
    this.hasSearched = true;
    const token = this.paginationTokens[pageIndex] ?? undefined;
    const isPremium = this.store.selectSnapshot(UserProfileState.isPremium);

    const dispatch$ = isPremium
      ? this.store.dispatch(new SearchPremiumUsers(this.lat, this.lng, this.radius, {
          gender: this.gender,
          hasKids: this.hasKids,
          ageRange: { ...this.ageRange },
        }, token))
      : this.store.dispatch(new SearchNearbyUsers(this.lat, this.lng, this.radius, token));

    dispatch$.subscribe(() => {
      const nextToken = this.store.selectSnapshot(SearchState.nextToken);
      if (nextToken && !this.paginationTokens.includes(nextToken)) {
        this.paginationTokens.push(nextToken);
        this.hasMoreResults = true;
      }
      this.currentPage = pageIndex;
    });
  }

  nextPage() {
    if (this.paginationTokens[this.currentPage + 1] !== undefined) {
      this.searchUsers(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.searchUsers(this.currentPage - 1);
    }
  }

  // New methods for premium filters
  upgradeToPremium() {
    this.router.navigate(['/premium-upgrade']);
  }

  clearFilters() {
    this.gender = null;
    this.hasKids = null;
    this.ageRange = { min: 18, max: 100 };
  }
}