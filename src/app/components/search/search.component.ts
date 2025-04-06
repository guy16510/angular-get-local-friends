import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Store } from '@ngxs/store';
import { SearchNearbyUsers, SearchUsers, SetSearchFilters } from '../../store/actions/search.actions';
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
  isPremium$: Observable<boolean> = this.store.select(state => state.search.isPremium);
  
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

  constructor(private store: Store, private router: Router) {}

  async ngOnInit() {
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

    this.updateGridCols();
    window.addEventListener('resize', this.updateGridCols.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.updateGridCols.bind(this));
  }

  updateGridCols() {
    const width = window.innerWidth;
    if (width < 600) {
      this.cols = 1;
    } else if (width < 960) {
      this.cols = 2;
    } else {
      this.cols = 3;
    }
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
    this.store.dispatch(new SearchNearbyUsers(this.lat, this.lng, this.radius, token)).subscribe(() => {
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