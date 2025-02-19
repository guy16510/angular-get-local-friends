import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(false);
  darkMode$ = this.darkMode.asObservable();

  constructor() {
    const storedTheme = localStorage.getItem('dark-mode');
    const isDark = storedTheme === 'true';

    // Set the theme state
    this.darkMode.next(isDark);

    // Apply the theme immediately
    this.applyTheme(isDark);
  }

  toggleDarkMode(): void {
    const isDark = !this.darkMode.value;
    this.darkMode.next(isDark);
    localStorage.setItem('dark-mode', String(isDark));

    // Apply the theme change
    this.applyTheme(isDark);
  }

  isDarkMode(): boolean {
    return this.darkMode.value;
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }
}