import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store, Select } from '@ngxs/store';
import { SubmitUserProfile } from '../../store/actions/user-profile.actions';
import { FetchIdentityId } from '../../store/actions/auth.actions';
import { AuthState } from '../../store/states/auth.state';
import { GeolocationService } from '../../services/geolocation.service';
import { firstValueFrom, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { LoadingComponent } from '../shared/loading/loading.component';
import { UserProfileState } from '../../store/states/user-profile.state';


@Component({
    selector: 'app-account-setup',
    templateUrl: './account-setup.component.html',
    styleUrls: ['./account-setup.component.css'],
    imports: [CommonModule, MaterialModule, LoadingComponent]
})
export class AccountSetupComponent implements OnInit {
  loading$: Observable<boolean> = this.store.select(state => state.userProfile?.loading ?? false);
  error$: Observable<string | null> = this.store.select(state => state.userProfile.error);

  identityId: string | null = null;
  userName: string = '';
  lat: number | null = null;
  lng: number | null = null;
  locationMessage: string = "Fetching approximate location...";
  preciseLocationGranted = false;

  geoLoading$!: Observable<boolean>;
  geoError$!: Observable<string | null>;
  surveyAnswers: any = null;

  constructor(
    private store: Store,
    private router: Router,
    private geoService: GeolocationService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.initializeUser();
    await this.fetchSurveyData();
    await this.fetchLocation();
  }

  private async initializeUser(): Promise<void> {
    // Check if a user is logged in.
    const currentUser = this.store.selectSnapshot(AuthState.user);
    if (!currentUser) {
      console.warn("🚨 No logged-in user found, redirecting to login");
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/account-setup' } });
      return;
    }
  
    // If user is logged in, get the identityId.
    this.identityId = this.store.selectSnapshot(AuthState.identityId);
    debugger; //add userName
    this.userName = this.store.selectSnapshot(AuthState.user);
    if (!this.identityId) {
      await firstValueFrom(this.store.dispatch(new FetchIdentityId()));
      this.identityId = this.store.selectSnapshot(AuthState.identityId);
      this.userName = this.store.selectSnapshot(AuthState.user);
    }
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

  formatSurveyAnswers(obj: any) {
    return Object.entries(obj).flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(answer => ({ questionId: Number(key), answer }));
      } 
      return { questionId: Number(key), answer: value };
    });
  }

  private async fetchLocation(): Promise<void> {
    this.geoLoading$ = this.geoService.loading$;
    this.geoError$ = this.geoService.error$;

    try {
      const location = await this.geoService.getIPLocation();
      this.lat = location.lat;
      this.lng = location.lng;
      this.locationMessage = `We estimated your location as ${location.city}, ${location.region}. For better results, allow precise location.`;
    } catch (error) {
      this.locationMessage = "We couldn't get your location. Allow precise location for better results.";
    }
  }

  async requestPreciseLocation(): Promise<void> {
    try {
      const location = await this.geoService.getCurrentPosition();
      this.lat = location.lat;
      this.lng = location.lng;
      this.preciseLocationGranted = true;
      this.locationMessage = "✅ Precise location granted!";
    } catch (error) {
      console.error("❌ Failed to get precise location:", error);
      this.locationMessage = "We couldn't get your precise location.";
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.lat || !this.lng) {
      alert("Please enable location services for better matching.");
      return;
    }

    if (!this.surveyAnswers) {
      console.warn("🚨 No survey answers found, redirecting...");
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

    this.store.dispatch(new SubmitUserProfile(payload)).subscribe((val) => {
      const userProfile = this.store.selectSnapshot(UserProfileState.profile);
      console.log("✅ Profile submitted:", userProfile);
      debugger;
      // setTimeout(() => this.router.navigate(['/dashboard']), 2000);
    });
  }
}