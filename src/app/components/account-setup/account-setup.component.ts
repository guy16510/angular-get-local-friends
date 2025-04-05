import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthState } from '../../store/states/auth.state';
import { CheckAuth } from '../../store/actions/auth.actions';
import { GeolocationService } from '../../services/geolocation.service';
import { SubmitUserProfile } from '../../store/actions/user-profile.actions';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { LoadingComponent } from '../shared/loading/loading.component';
import { firstValueFrom, Observable } from 'rxjs';
import { UserProfileState } from '../../store/states/user-profile.state';

@Component({
  selector: 'app-account-setup',
  templateUrl: './account-setup.component.html',
  styleUrls: ['./account-setup.component.css'],
  imports: [CommonModule, MaterialModule, LoadingComponent]
})
export class AccountSetupComponent implements OnInit {
  identityId: string | null = null;
  userName: string = '';
  lat: number | null = null;
  lng: number | null = null;
  locationMessage: string = "Fetching approximate location...";
  preciseLocationGranted = false;
  surveyAnswers: any;

  loading$: Observable<boolean> = this.store.select(UserProfileState.loading);
  authLoading$: Observable<boolean> = this.store.select(AuthState.loading);
  error$: Observable<string | null> = this.store.select(UserProfileState.error);
  geoLoading$!: Observable<boolean>;
  geoError$!: Observable<string | null>;

  constructor(
    private store: Store,
    private router: Router,
    private geoService: GeolocationService
  ) {}

  async ngOnInit(): Promise<void> {
    const identityId = this.store.selectSnapshot(AuthState.identityId);
    const userName = this.store.selectSnapshot(AuthState.userName);
    if (!identityId || !userName) {
      console.warn("🚨 No authenticated user detected, fetching authentication state...");
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
      console.error("User authentication state missing or incomplete.");
      debugger;
      this.router.navigate(['/login'], { queryParams: { createAccount: true } });
      return;
    }

    this.identityId = identityId;
    this.userName = userName;
  }

  async fetchSurveyData(): Promise<void> {
    try {
      const surveyFormState = this.store.selectSnapshot(state => state.survey.form); 
      if(surveyFormState?.status === "VALID") {
        this.surveyAnswers = this.formatSurveyAnswers(surveyFormState.model);
        // this.surveyAnswers = surveyFormState.model;
        console.log("✅ Survey data retrieved:", this.surveyAnswers);
      } else {
        console.warn("🚨 No survey data found, redirecting...");
        this.router.navigate(['/survey']);
      }
    } catch (error) {
      console.error("❌ Error retrieving survey data:", error);
      this.router.navigate(['/survey']);
    }
  }

  async fetchLocation(): Promise<void> {
    this.geoLoading$ = this.geoService.loading$;
    this.geoError$ = this.geoService.error$;

    try {
      const location = await this.geoService.getIPLocation();
      this.lat = location.lat;
      this.lng = location.lng;
      this.locationMessage = `We estimated your location as ${location.city}, ${location.region}. For better results, allow precise location.`;
    } catch (error: any) {
      this.locationMessage = "Couldn't fetch location. Allow precise location for better results.";
    }
  }

  async requestPreciseLocation(): Promise<void> {
    this.geoLoading$ = this.geoService.loading$;
    this.geoError$ = this.geoService.error$;

    try {
      const position = await this.geoService.getCurrentPosition();
      this.lat = position.lat;
      this.lng = position.lng;
      this.preciseLocationGranted = true;
      this.locationMessage = "✅ Precise location enabled.";
    } catch (error: any) {
      console.error("❌ Error fetching precise location:", error);
      this.locationMessage = "Could not get precise location. Please allow access.";
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.lat || !this.lng) {
      alert("Please enable location services to proceed.");
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
      console.log("✅ Profile submitted successfully.");
      this.router.navigate(['/myProfile']);
    });
  }

  formatSurveyAnswers(obj: Record<string, unknown>) {
    const compact: Record<string, string | string[]> = {};
  
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        const filtered = value.filter(v => typeof v === 'string') as string[];
        const unique = [...new Set(filtered)];
        compact[key] = unique.length === 1 ? unique[0] : unique;
      } else if (typeof value === 'string') {
        compact[key] = value;
      } else {
        console.warn(`Unexpected value for questionId ${key}:`, value);
      }
    }
    return compact;
  }

}
