import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../../../amplify/data/resource';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatError } from '@angular/material/form-field';
import { ThemeService } from '../../services/theme.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatFormFieldModule, MatInputModule, MatError, MatCardModule, MatButtonModule],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css'
})
export class ContactUsComponent {
  contactForm: FormGroup;
  submitted = false;
  success = false;
  error = '';
  isDarkMode: boolean;

  constructor(private fb: FormBuilder, private themeService: ThemeService) {
    this.contactForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      summary: ['', Validators.required]
    });
    this.isDarkMode = this.themeService.isDarkMode();
  }

  async onSubmit() {
    this.submitted = true;
    this.error = '';
    
    if (this.contactForm.valid) {
      try {
        const client = generateClient<Schema>();
        
        const response = await client.models.Contact.create({
          ...this.contactForm.value,
          createdAt: new Date().toISOString(),
          ipAddress: await this.getIpAddress()
        });

        this.success = true;
        this.contactForm.reset();
        this.submitted = false;
      } catch (err) {
        this.error = 'Failed to submit contact form. Please try again.';
        console.error('Error submitting contact form:', err);
      }
    }
  }

  private async getIpAddress(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (err) {
      console.error('Error getting IP address:', err);
      return '0.0.0.0';
    }
  }
}
