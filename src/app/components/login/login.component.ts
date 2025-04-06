import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormGroup, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { signUp, confirmSignUp } from '@aws-amplify/auth';
import { Store } from '@ngxs/store';
import { switchMap } from 'rxjs/operators';
import { CheckAuth, Login } from '../../store/actions/auth.actions';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  // Forms
  signUpForm: FormGroup;
  signInForm: FormGroup;
  confirmForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;

  // State toggles
  isSignUp = false;
  isConfirming = false;

  constructor(
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
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

    this.confirmForm = this.fb.group({
      confirmationCode: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Determine whether to show sign-up based on query param (?createAccount=true)
    this.route.queryParams.subscribe(params => {
      this.isSignUp = !!params['createAccount'];
    });
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
      // After sign-up, set isConfirming to true so the user can enter the confirmation code.
      this.isConfirming = true;
    } catch (error) {
      console.error('Error during sign up:', error);
    }
  }

  async onConfirmSignUp() {
    if (this.confirmForm.invalid) {
      this.confirmForm.markAllAsTouched();
      return;
    }
    const { confirmationCode } = this.confirmForm.value;
    const email = this.signUpForm.get('email')?.value;
    try {
      const result = await confirmSignUp({ username: email, confirmationCode });
      console.log('Confirmation successful:', result);
      // After successful confirmation, show the sign-in form.
      this.isConfirming = false;
      this.isSignUp = false;
    } catch (error) {
      console.error('Error during confirmation:', error);
    }
  }

    onSignIn(): void {
      if (this.signInForm.valid) {
        const { email, password } = this.signInForm.value;
        this.store.dispatch(new Login(email, password))
          .pipe(
            switchMap(() => this.store.dispatch(new CheckAuth()))
          )
          .subscribe({
            next: () => {
              const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
              this.router.navigate([returnUrl]);
            },
            error: (error: Error) => {
              console.error('Sign in error:', error);
            }
          });
      }
    }

  // Validators and helper methods remain the same.
  private passwordStrengthValidator(control: any): { [key: string]: any } | null {
    const password = control.value;
    if (!password) return null;
    const hasUpperCase = /[A-Z]+/.test(password);
    const hasLowerCase = /[a-z]+/.test(password);
    const hasNumeric = /[0-9]+/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]+/.test(password);
    const isLongEnough = password.length >= 8;
    const valid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar && isLongEnough;
    return valid ? null : {
      passwordStrength: {
        hasUpperCase,
        hasLowerCase,
        hasNumeric,
        hasSpecialChar,
        isLongEnough
      }
    };
  }

  private passwordMatchValidator(control: any): any {
    const formGroup = control.parent;
    if (!formGroup) return null;
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password && confirmPassword && password !== confirmPassword ? { passwordMismatch: true } : null;
  }

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

  getPasswordMatchError(): string | null {
    const password = this.signUpForm.get('password')?.value;
    const confirmPassword = this.signUpForm.get('confirmPassword')?.value;
    return password && confirmPassword && password !== confirmPassword ? 'Passwords do not match' : null;
  }
}