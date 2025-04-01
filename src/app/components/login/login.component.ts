import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, FormBuilder } from '@angular/forms';
import { Hub } from '@aws-amplify/core';
import { signUp } from '@aws-amplify/auth';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';
import { Store } from '@ngxs/store';
import { CheckAuth, Logout } from '../../store/actions/auth.actions';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    AmplifyAuthenticatorModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  // Password strength validator
  private passwordStrengthValidator(control: AbstractControl): { [key: string]: any } | null {
    const password = control.value;
    if (!password) return null;

    const hasUpperCase = /[A-Z]+/.test(password);
    const hasLowerCase = /[a-z]+/.test(password);
    const hasNumeric = /[0-9]+/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]+/.test(password);
    const isLongEnough = password.length >= 8;

    const valid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar && isLongEnough;

    if (!valid) {
      return {
        passwordStrength: {
          hasUpperCase,
          hasLowerCase,
          hasNumeric,
          hasSpecialChar,
          isLongEnough
        }
      };
    }

    return null;
  }

  // Password match validator
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const formGroup = control.parent;
    if (!formGroup) return null;

    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (!password || !confirmPassword) return null;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // Create a reactive form that requires a nickname
  signUpForm: FormGroup;
  signInForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  private unsubscribeHub?: () => void;
  private hasDispatchedLogout = false;

  constructor(
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.signUpForm = this.fb.group({
      nickname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.unsubscribeHub = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signedIn') {
        this.store.dispatch(new CheckAuth()).subscribe((user: any) => {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigate([returnUrl]);
        });
      }

      if (payload.event === 'signedOut' && !this.hasDispatchedLogout) {
        console.log('User signed out');
        this.hasDispatchedLogout = true;
        this.store.dispatch(new Logout());
      }
    });
  }

  ngOnDestroy() {
    if (this.unsubscribeHub) {
      this.unsubscribeHub();
    }
  }

  async onSignUp() {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }
  
    const { nickname, email, password } = this.signUpForm.value;
  
    try {
      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            nickname,
          }
        }
      });
      console.log('Sign up successful:', result);
      // Transition to a confirmation screen, if needed.
    } catch (error) {
      console.error('Error during sign up:', error);
    }
  }

  // Helper method to check password strength requirements
  getPasswordStrengthErrors(): string[] {
    const errors = this.signUpForm.get('password')?.errors?.['passwordStrength'];
    if (!errors) return [];

    const messages: string[] = [];
    if (!errors.hasUpperCase) messages.push('Include at least one uppercase letter');
    if (!errors.hasLowerCase) messages.push('Include at least one lowercase letter');
    if (!errors.hasNumeric) messages.push('Include at least one number');
    if (!errors.hasSpecialChar) messages.push('Include at least one special character');
    if (!errors.isLongEnough) messages.push('Password must be at least 8 characters long');

    return messages;
  }

  // Helper method to check if passwords match
  getPasswordMatchError(): string | null {
    const password = this.signUpForm.get('password')?.value;
    const confirmPassword = this.signUpForm.get('confirmPassword')?.value;

    if (!password || !confirmPassword) return null;
    return password === confirmPassword ? null : 'Passwords do not match';
  }

  handleSignOut(signOutFn: Function) {
    signOutFn();
  }

  onSignIn(): void {
    if (this.signInForm.valid) {
      const { email, password } = this.signInForm.value;
      this.authService.login(email, password).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error: Error) => {
          console.error('Sign in error:', error);
        }
      });
    }
  }
}