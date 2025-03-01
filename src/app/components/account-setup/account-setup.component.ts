import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store, Select } from '@ngxs/store';
import { SubmitUserProfile } from '../../store/actions/user-profile.actions';
import { FetchIdentityId } from '../../store/actions/auth.actions';
import { AuthState } from '../../store/states/auth.state';
import { UserProfileState } from '../../store/states/user-profile.state';
import { SurveyState } from '../../store/states/survey.state';
import { GeolocationService } from '../../services/geolocation.service';
import { firstValueFrom, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-account-setup',
  templateUrl: './account-setup.component.html',
  styleUrls: ['./account-setup.component.css'],
  imports: [CommonModule, MaterialModule, LoadingComponent],
  standalone: true
})
export class AccountSetupComponent implements OnInit {
  @Select(UserProfileState.loading) loading$!: Observable<boolean>;
  @Select(UserProfileState.error) error$!: Observable<string | null>;
  @Select(SurveyState.form) surveyFormData$!: Observable<any>;

  identityId: string | null = null;
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
    this.identityId = this.store.selectSnapshot(AuthState.identityId);

    if (!this.identityId) {
      console.warn("🚨 No identityId found, redirecting to login");
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/account-setup' } });
      return;
    }

    // Fetch identityId if missing
    if (!this.identityId) {
      await firstValueFrom(this.store.dispatch(new FetchIdentityId()));
      this.identityId = this.store.selectSnapshot(AuthState.identityId);
    }
  }

  async fetchSurveyData(): Promise<void> {
    try {
      this.surveyAnswers = await firstValueFrom(this.store.select(SurveyState.form));

      if (!this.surveyAnswers || Object.keys(this.surveyAnswers).length === 0) {
        console.warn("🚨 No survey data found, redirecting...");
        this.router.navigate(['/survey']);
      } else {
        console.log("✅ Retrieved Survey Data:", this.surveyAnswers);
      }
    } catch (error) {
      console.error("❌ Error retrieving survey data:", error);
      this.router.navigate(['/survey']);
    }
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
      surveyQuestions: this.surveyAnswers,
    };

    this.store.dispatch(new SubmitUserProfile(payload)).subscribe(() => {
      setTimeout(() => this.router.navigate(['/dashboard']), 2000);
    });
  }
}