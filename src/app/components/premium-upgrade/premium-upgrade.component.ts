import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { UserProfileState } from '../../store/states/user-profile.state';
import { EnrollPremium, RemovePremium } from '../../store/actions/premium.actions';
import { ToastMessageService } from '../../services/toast-message.service';

@Component({
  selector: 'app-premium-upgrade',
  templateUrl: './premium-upgrade.component.html',
  styleUrls: ['./premium-upgrade.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatExpansionModule
  ]
})
export class PremiumUpgradeComponent implements OnInit {
  isPremium$: Observable<boolean>;
  isLoading = false;

  constructor(
    private store: Store,
    private toastService: ToastMessageService
  ) {
    this.isPremium$ = this.store.select(UserProfileState.isPremium);
  }

  ngOnInit(): void {}

  onUpgradeClick(): void {
    this.isLoading = true;
    this.store.dispatch(new EnrollPremium()).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.success('Successfully upgraded to premium!', 'Close');
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.error('Failed to upgrade to premium. Please try again.', 'Close');
      }
    });
  }

  cancelPremium(): void {
    this.isLoading = true;
    this.store.dispatch(new RemovePremium()).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.success('Successfully cancelled premium subscription.', 'Close');
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.error('Failed to cancel premium subscription. Please try again.', 'Close');
      }
    });
  }
} 