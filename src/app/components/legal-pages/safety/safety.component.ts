import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../utils/material.module';
import { scrollToTop } from '../../../utils/window.utils';


@Component({
  selector: 'app-safety',
  templateUrl: './safety.component.html',
  styleUrls: ['./safety.component.css'],
  standalone: true,
  imports: [CommonModule, MaterialModule]
})
export class SafetyComponent implements OnInit {
  ngOnInit(): void {
    scrollToTop();
  }
}
