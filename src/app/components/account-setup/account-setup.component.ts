import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngxs/store';
import { CheckAuth } from '../../store/actions/auth.actions';
import { SubmitUserProfile } from '../../store/actions/user-profile.actions';
import { FetchPreciseLocation, FetchNominatimLocation, SetManualLocation } from '../../store/actions/geolocation.action';
import { GenerateCompatibilityInsights } from '../../store/actions/compatibility.actions';
import { firstValueFrom, Observable } from 'rxjs';
import { AuthState } from '../../store/states/auth.state';
import { UserProfileState } from '../../store/states/user-profile.state';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../utils/material.module';
import { LoadingComponent } from '../shared/loading/loading.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-account-setup',
  standalone: true,
  imports: [CommonModule, MaterialModule, LoadingComponent, RouterModule],
  templateUrl: './account-setup.component.html',
  styleUrls: ['./account-setup.component.css']
})
export class AccountSetupComponent implements OnInit {
  identityId: string | null = null;
  userName: string = '';
  lat: number | null = null;
  lng: number | null = null;
  locationMessage: string = 'Fetching approximate location...';
  preciseLocationGranted = false;
  showLocationWarning = false;

  // Fallback input properties (remains false by default)
  fallbackInputVisible: boolean = false;
  fallbackAddress: string = '';

  surveyAnswers: any;

  loading$: Observable<boolean> = this.store.select(UserProfileState.loading);
  authLoading$: Observable<boolean> = this.store.select(AuthState.loading);
  error$: Observable<string | null> = this.store.select(UserProfileState.error);
  geoLoading$!: Observable<boolean>;
  geoError$!: Observable<string | null>;
  fallbackLocations$: Observable<Array<{ lat: number; lng: number; displayName: string }>> =
    this.store.select((state: any) => state.geolocation.fallbackLocations);

  constructor(
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    const identityId = this.store.selectSnapshot(AuthState.identityId);
    const userName = this.store.selectSnapshot(AuthState.userName);

    if (!identityId || !userName) {
      console.warn('No authenticated user detected, fetching authentication state...');
      await firstValueFrom(this.store.dispatch(new CheckAuth()));
    }

    await this.initializeUser();
    await this.fetchSurveyData();
    await this.fetchLocation();
  }

  private async initializeUser(): Promise<void> {
    const identityId = this.store.selectSnapshot(AuthState.identityId);
    const userName = this.store.selectSnapshot(AuthState.userName);

    if (!identityId || !userName) {
      console.error('User authentication state missing or incomplete.');
      this.router.navigate(['/login'], { queryParams: { createAccount: true } });
      return;
    }

    this.identityId = identityId;
    this.userName = userName;
  }

  async fetchSurveyData(): Promise<void> {
    try {
      const surveyState = this.store.selectSnapshot((state: any) => state.survey.form);
      if (surveyState?.status === 'VALID') {
        this.surveyAnswers = this.formatSurveyAnswers(surveyState.model);
        console.log('Survey data retrieved:', this.surveyAnswers);
      } else {
        console.warn('No valid survey data found, redirecting to survey.');
        this.router.navigate(['/survey']);
      }
    } catch (error) {
      console.error('Error retrieving survey data:', error);
      this.router.navigate(['/survey']);
    }
  }

  async fetchLocation(): Promise<void> {
    try {
      // Attempt to fetch precise location (with internal IP and Nominatim fallback)
      await firstValueFrom(this.store.dispatch(new FetchPreciseLocation()));
      const state = this.store.selectSnapshot((s: any) => s.geolocation);
      this.lat = state.lat;
      this.lng = state.lng;
      this.preciseLocationGranted = state.preciseLocationGranted;
      this.locationMessage = state.preciseLocationGranted
        ? '✅ Precise location enabled.'
        : `We estimated your location as ${state.city}, ${state.region}.`;
    } catch (error: any) {
      // On error, if there are fallback results display them, otherwise show manual input.
      const state = this.store.selectSnapshot((s: any) => s.geolocation);
      if (state.fallbackLocations && state.fallbackLocations.length > 0) {
        this.locationMessage = 'Please select your location from the results below.';
      } else {
        this.locationMessage = 'Failed to retrieve location. Please enter your city, state or address below.';
        this.fallbackInputVisible = true;
      }
    }
    // Update geo loading and error observables.
    this.geoLoading$ = this.store.select((s: any) => s.geolocation.loading);
    this.geoError$ = this.store.select((s: any) => s.geolocation.error);
  }

  /**
   * onTryAgain() is triggered by the "Try Again" button.
   * - If the fallback input is already visible, it clears the input for retyping.
   * - Otherwise, it tries to re-fetch the location. If the location remains unavailable,
   *   it forces the fallback input to display.
   */
  onTryAgain(): void {
    if (this.fallbackInputVisible) {
      // Already showing fallback input: clear input for retyping.
      this.fallbackAddress = '';
      this.locationMessage = 'Please enter your city, state or address below.';
    } else {
      // Attempt to fetch location automatically.
      this.fetchLocation().then(() => {
        // If no lat/lng were found, force the manual fallback input to appear.
        if (!this.lat || !this.lng) {
          this.fallbackInputVisible = true;
          this.locationMessage = 'Please enter your city, state or address below.';
        }
      }).catch(() => {
        // On error, show fallback input.
        this.fallbackInputVisible = true;
        this.locationMessage = 'Please enter your city, state or address below.';
      });
    }
  }

  searchFallbackLocation(): void {
    if (!this.fallbackAddress || this.fallbackAddress.trim() === '') {
      alert('Please enter a valid address.');
      return;
    }
    // Dispatch NGXS action to search Nominatim with the user-provided address.
    this.store.dispatch(new FetchNominatimLocation(this.fallbackAddress)).subscribe({
      next: () => {
        // Hide the manual input as fallback results are now available.
        this.fallbackInputVisible = false;
        this.locationMessage = 'Select your location from the search results below.';
      },
      error: (err: any) => {
        console.error('Error searching for location:', err);
        alert('Unable to find location. Please try a different address.');
      }
    });
  }

  selectFallbackLocation(loc: { lat: number; lng: number; displayName: string }): void {
    this.lat = loc.lat;
    this.lng = loc.lng;
    this.locationMessage = `Location selected: ${loc.displayName}`;
    // Update the geolocation state with the selected fallback location.
    this.store.dispatch(new SetManualLocation(loc.lat, loc.lng, loc.displayName));
  }

  async onSubmit(): Promise<void> {
    if (!this.lat || !this.lng) {
      alert('Please enable location services or select a location to proceed.');
      return;
    }

    if (!this.surveyAnswers) {
      this.router.navigate(['/survey']);
      return;
    }

    const payload = {
      identityId: this.identityId!,
      locationLat: this.lat,
      locationLng: this.lng,
      surveyAnswers: this.surveyAnswers,
      userName: this.userName
    };

    this.store.dispatch(new SubmitUserProfile(payload)).subscribe(() => {
      console.log('Profile submitted successfully.');
      if (this.identityId) {
        this.store.dispatch(new GenerateCompatibilityInsights(this.identityId));
      }
      this.router.navigate(['/myProfile']);
    });
  }

  private formatSurveyAnswers(obj: Record<string, unknown>): Record<string, string | string[]> {
    const compact: Record<string, string | string[]> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        const unique = Array.from(new Set(value.filter(v => typeof v === 'string')));
        compact[key] = unique.length === 1 ? unique[0] : unique;
      } else if (typeof value === 'string') {
        compact[key] = value;
      } else {
        console.warn(`Unexpected value for question ${key}:`, value);
      }
    }
    return compact;
  }
}