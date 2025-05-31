import { Component } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Select } from '@ngxs/store';
import { ProgressStateModel } from '../../../store/states/progress.state';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [MatProgressBarModule, CommonModule],
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.css']
})
export class ProgressBarComponent {
  @Select((state: { progress: ProgressStateModel }) => state.progress.progress)
  progress$!: Observable<number>;

  getProgressColor(progress: number): 'warn' | 'accent' | 'primary' {
    if (progress < 40) return 'warn';
    if (progress < 70) return 'accent';
    return 'primary';
  }
}
