// src/app/services/search-cache.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchCacheService {
  private searchResultsSubject = new BehaviorSubject<any[]>([]);
  
  setSearchResults(results: any[]): void {
    this.searchResultsSubject.next(results);
  }

  getSearchResults(): any[] {
    return this.searchResultsSubject.getValue();
  }
}