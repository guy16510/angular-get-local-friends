// material.module.ts
import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import {MatChipsModule} from '@angular/material/chips';
import { MatDividerModule }  from '@angular/material/divider';
import { MatTooltipModule }  from '@angular/material/tooltip';

@NgModule({
  exports: [
    MatListModule,
    MatIconModule,
    MatCheckboxModule,
    MatRadioModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    MatSliderModule,
    MatProgressBarModule,
    MatGridListModule,
    MatSelectModule,
    MatMenuModule,
    FormsModule,
    MatChipsModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule
  ]
})
export class MaterialModule {}