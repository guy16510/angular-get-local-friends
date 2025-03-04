import { Component, HostListener, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { AuthState } from '../../../store/states/auth.state';
import { Logout } from '../../../store/actions/auth.actions';

@Component({
    selector: 'app-header',
    imports: [RouterModule, MatIconModule, CommonModule,],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css'
})
export class HeaderComponent{
  @Select(AuthState.isLoggedIn) isLoggedIn$!: Observable<boolean>;
  // On scroll darken header
  @HostListener("window:scroll", [])
  onWindowScroll() {
    const header = document.querySelector('.header-container');
    if (window.scrollY > 50) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }
  
  isDarkMode = false;

  constructor(private themeService: ThemeService, private store: Store) {
    this.isDarkMode = this.themeService.isDarkMode();
  }

  toggleTheme(): void {
    this.themeService.toggleDarkMode();
    this.isDarkMode = this.themeService.isDarkMode();
  }

  async signOut() {
    try {
      this.store.dispatch(new Logout());
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}