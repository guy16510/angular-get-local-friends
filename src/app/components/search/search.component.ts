import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';
import { SearchNearbyUsers } from '../../store/actions/search.actions';
import { SearchState } from '../../store/states/search.state';
import { GeolocationService } from '../../services/geolocation.service';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { ImageDisplayComponent } from '../image-display/image-display.component';
import { LoadingComponent } from '../shared/loading/loading.component';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  imports: [
    CommonModule,
    MaterialModule,
    ImageDisplayComponent,
    LoadingComponent,
    FormsModule,
    RouterModule
  ],
  standalone: true
})
export class SearchComponent implements OnInit, OnDestroy {
  loading$: Observable<boolean> = this.store.select(SearchState.loading);
  nearbyUsers$: Observable<any[]> = this.store.select(SearchState.nearbyUsers);
  nextToken$: Observable<string | null> = this.store.select(SearchState.nextToken);

  lat!: number;
  lng!: number;
  city: string | null = null;
  radius = 10;
  radiusOptions = [5, 10, 15, 25, 50];

  paginationTokens: (string | null)[] = [null];
  currentPage: number = 0;
  hasMoreResults: boolean = false;
  
  // Responsive grid columns property
  cols: number = 3;

  constructor(
    private geoService: GeolocationService,
    private store: Store
  ) {}

  async ngOnInit() {
    const ipLocation = await this.geoService.getIPLocation();
    this.lat = ipLocation.lat;
    this.lng = ipLocation.lng;
    this.city = ipLocation.city || null;

    // Set initial grid columns and listen for window resize events
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

  async usePreciseLocation() {
    try {
      const preciseLoc = await this.geoService.getCurrentPosition();
      this.lat = preciseLoc.lat;
      this.lng = preciseLoc.lng;
    } catch (error) {
      console.error('Error fetching precise location:', error);
    }
  }

  isOnline(lastOnlineAt: string) {
    if (lastOnlineAt) {
      // Consider user online if last seen within 5 minutes
      return Date.now() - new Date(lastOnlineAt).getTime() < 5 * 60 * 1000;
    }
    return false;
  }

  searchUsers(pageIndex = 0) {
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
}