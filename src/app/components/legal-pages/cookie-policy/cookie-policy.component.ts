import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../utils/material.module';
import { scrollToTop } from '../../../utils/window.utils';

@Component({
  selector: 'app-cookie-policy',
  templateUrl: './cookie-policy.component.html',
  styleUrls: ['./cookie-policy.component.scss'],
  standalone: true,
  imports: [CommonModule, MaterialModule]
})
export class CookiePolicyComponent implements OnInit {
  ngOnInit(): void {
    scrollToTop();
  }
}
