import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
export class PremiumUpgradeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isPremium$: Observable<boolean>;
  loading$ = this.store.select(UserProfileState.loading);
  error$ = this.store.select(UserProfileState.error);

  constructor(
    private store: Store,
    private toastService: ToastMessageService
  ) {
    this.isPremium$ = this.store.select(UserProfileState.isPremium);
  }

  ngOnInit(): void {
    this.error$.pipe(takeUntil(this.destroy$)).subscribe(error => {
      if (error) {
        this.toastService.error(error, 'Close');
      }
    });
  }

  enrollPremium(): void {
    this.store.dispatch(new EnrollPremium()).subscribe({
      next: () => {
        if (!this.store.selectSnapshot(UserProfileState.error)) {
          this.toastService.success('Successfully enrolled in premium!', 'Close');
        }
      },
      error: (error) => {
        this.toastService.error(error.message, 'Close');
      }
    });
  }

  cancelPremium(): void {
    this.store.dispatch(new RemovePremium()).subscribe({
      next: () => {
        if (!this.store.selectSnapshot(UserProfileState.error)) {
          this.toastService.success('Successfully cancelled premium subscription.', 'Close');
        }
      },
      error: (error) => {
        this.toastService.error(error.message, 'Close');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
} 