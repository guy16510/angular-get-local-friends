import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { map, Observable } from 'rxjs';
import { UserProfile } from '../../models/user-profile.model';
import { UserProfileState } from '../../store/states/user-profile.state';
import { LoadAnimalProfile, LoadUserProfile, SubmitUserProfile } from '../../store/actions/user-profile.actions';
import { MaterialModule } from '../../utils/material.module';
import { UploadComponent } from '../image-upload/image-upload.component';
import { LoadingComponent } from '../shared/loading/loading.component';
import { CommonModule } from '@angular/common';
import { AuthState } from '../../store/states/auth.state';
import { FileService } from '../../services/file.service';
import { CheckAuth } from '../../store/actions/auth.actions';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css'],
  imports: [MaterialModule, UploadComponent, LoadingComponent, CommonModule],
  standalone: true
})
export class MyProfileComponent implements OnInit {
  @Select(UserProfileState.loading) loading$!: Observable<boolean>;
  @Select(UserProfileState.error) error$!: Observable<string | null>;
  userProfile$!: Observable<UserProfile | null>;

  @ViewChild('uploadComponent') uploadComponent!: UploadComponent;

  readonly fallbackImage = '/assets/images/noImageUploaded.jpg';
  profileImage: string = this.fallbackImage;

  private store = inject(Store);
  private map: L.Map | undefined;

  constructor(
    private fileService: FileService,
    private router: Router
  ) {
    // Fix for default Leaflet icon paths in Angular
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
    });
  }

  ngOnInit(): void {
    this.store.dispatch(new CheckAuth()).subscribe(() => {
      const identityId = this.store.selectSnapshot(AuthState.identityId);
      if (!identityId) return;

      this.userProfile$ = this.store.select(UserProfileState.getProfileById).pipe(
        map(getById => getById(identityId))
      );

      const existingProfile = this.store.selectSnapshot(UserProfileState.getProfileById)(identityId);
      if (!existingProfile) {
        this.store.dispatch(new LoadUserProfile(identityId));
      }

      this.userProfile$.subscribe(profile => {
        if (profile) {
          this.loadProfileImage();
          setTimeout(() => {
            this.initializeMap();
          }, 0);
        }
      });
    });
  }

  async loadProfileImage(): Promise<void> {
    try {
      const identityId = this.store.selectSnapshot(AuthState.identityId);
      if (!identityId) throw new Error('Missing identityId');

      const imgSrc = await this.fileService.getUserImage(identityId);
      this.profileImage = imgSrc || this.fallbackImage;
    } catch (err) {
      console.error('Image load failed:', err);
      this.profileImage = this.fallbackImage;
    }
  }

  initializeMap(): void {
    if (this.map) {
      return; // Prevent reinitialization if the map already exists
    }
  
    // Initialize the map with a default location
    this.map = L.map('map', {
      center: [51.505, -0.09], // Default location (London)
      zoom: 13
    });
  
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  
    // Define a custom icon for the current location
    const currentLocationIcon = L.icon({
      iconUrl: '/assets/images/current-location.png', // Path to your custom icon
      iconSize: [32, 32], // Size of the icon
      iconAnchor: [16, 32], // Anchor point of the icon
      popupAnchor: [0, -32] // Position of the popup relative to the icon
    });
  
    // Use Geolocation API to get the user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
  
          // Center the map on the user's location
          if (this.map) this.map.setView([latitude, longitude], 13);
  
          // Add a marker at the user's location with the custom icon
          if (this.map) L.marker([latitude, longitude], { icon: currentLocationIcon }).addTo(this.map)
            .bindPopup('You are here!')
            .openPopup();
  
          // Optional: Force map redraw to ensure proper rendering
          setTimeout(() => {
            this.map?.invalidateSize();
          }, 200);
        },
        (error) => {
          console.error('Geolocation error:', error);
  
          // Fallback marker if geolocation fails
          if (this.map) L.marker([51.505, -0.09]).addTo(this.map)
            .bindPopup('Default location')
            .openPopup();
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
  
      // Fallback marker if geolocation is not supported
      L.marker([51.505, -0.09]).addTo(this.map)
        .bindPopup('Default location')
        .openPopup();
    }
  }

  onSubmit(updatedProfile: UserProfile): void {
    this.store.dispatch(new SubmitUserProfile(updatedProfile));
  }

  triggerEdit(): void {
    this.uploadComponent?.triggerFileInput();
  }

  onImageUpdated(newImage: string): void {
    this.profileImage = newImage;
  }

  viewAnimalProfile(): void {
    this.store.dispatch(new LoadAnimalProfile());
  }

  getDeepInsights(profile: UserProfile | null) {
    return profile?.deepInsights ?? null;
  }

  getSelfAnimalImage(profile: UserProfile | null): string | null {
    const animal = profile?.selfProfile?.animal;
    return animal ? `/assets/images/animal/male/${animal.toLowerCase()}.png` : null;
  }

  getSeekingAnimalImage(profile: UserProfile | null): string | null {
    const animal = profile?.seekingProfile?.animal;
    return animal ? `/assets/images/animal/male/${animal.toLowerCase()}.png` : null;
  }

  completeSurvey(): void {
    this.router.navigate(['/survey']);
  }
}
