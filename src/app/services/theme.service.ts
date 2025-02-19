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
    this.darkMode.next(storedTheme === 'true');
  }

  toggleDarkMode(): void {
    const isDark = !this.darkMode.value;
    this.darkMode.next(isDark);
    localStorage.setItem('dark-mode', String(isDark));
    document.body.classList.toggle('dark-theme', isDark);
    document.body.classList.toggle('light-theme', !isDark);
  }

  isDarkMode(): boolean {
    return this.darkMode.value;
  }
}
