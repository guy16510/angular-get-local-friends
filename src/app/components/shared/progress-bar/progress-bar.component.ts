import { Component, Input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Select } from '@ngxs/store';
import { ProgressStateModel } from '../../../store/states/progress.state';
import { Observable } from 'rxjs/internal/Observable';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-progress-bar',
    imports: [MatProgressBarModule, CommonModule],
    templateUrl: './progress-bar.component.html',
    styleUrl: './progress-bar.component.css'
})
export class ProgressBarComponent {
  @Select((state: { progress: ProgressStateModel }) => state.progress.progress)
  progress$!: Observable<number>;
}
