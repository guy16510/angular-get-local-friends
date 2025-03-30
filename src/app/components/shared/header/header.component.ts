import { Component, HostListener, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { AuthState } from '../../../store/states/auth.state';
import { Logout } from '../../../store/actions/auth.actions';
import { ChatState } from '../../../store/states/chat.state';

@Component({
  selector: 'app-header',
  imports: [RouterModule, MatIconModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Select(AuthState.isLoggedIn) isLoggedIn$!: Observable<boolean>;
  @Select(ChatState.unreadCount) unreadCount$!: Observable<number>;

  isDarkMode = false;

  @ViewChild('headerContainer') headerContainer!: ElementRef;

  constructor(private themeService: ThemeService, private store: Store, private router: Router) {
    this.isDarkMode = this.themeService.isDarkMode();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const header = document.querySelector('.header-container');
    if (window.scrollY > 50) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }

  // Listen for clicks on the document
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Check if the click target is outside of the header container
    if (this.headerContainer && !this.headerContainer.nativeElement.contains(event.target)) {
      this.closeMenu();
    }
  }

  toggleTheme(): void {
    this.themeService.toggleDarkMode();
    this.isDarkMode = this.themeService.isDarkMode();
  }

  async signOut() {
    try {
      this.store.dispatch(new Logout());
      this.router.navigate(['/']);
      this.closeMenu(); // Close menu if on mobile after logout
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  closeMenu(): void {
    // Only attempt to close the mobile menu if the viewport is narrow
    if (window.innerWidth < 768) {
      const menuToggle = document.getElementById('menu-toggle') as HTMLInputElement;
      if (menuToggle) {
        menuToggle.checked = false;
      }
    }
  }
}