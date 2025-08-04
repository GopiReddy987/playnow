import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="register-container">
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
        <h2>Create Account</h2>
        
        <div class="form-group">
          <label for="name">Full Name</label>
          <input id="name" type="text" formControlName="name" placeholder="Enter your full name" />
          <div class="error" *ngIf="registerForm.get('name')?.touched && registerForm.get('name')?.invalid">
            <span *ngIf="registerForm.get('name')?.errors?.['required']">Full name is required.</span>
            <span *ngIf="registerForm.get('name')?.errors?.['minlength']">Name must be at least 2 characters.</span>
          </div>
        </div>

        <div class="form-group">
          <label for="lastName">Last Name</label>
          <input id="lastName" type="text" formControlName="lastName" placeholder="Enter your last name" />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" type="email" formControlName="email" placeholder="Enter your email" />
          <div class="error" *ngIf="registerForm.get('email')?.touched && registerForm.get('email')?.invalid">
            <span *ngIf="registerForm.get('email')?.errors?.['required']">Email is required.</span>
            <span *ngIf="registerForm.get('email')?.errors?.['email']">Invalid email format.</span>
          </div>
        </div>

        <div class="form-group">
          <label for="phone">Phone Number</label>
          <input id="phone" type="tel" formControlName="phone" placeholder="Enter your phone number" />
          <div class="error" *ngIf="registerForm.get('phone')?.touched && registerForm.get('phone')?.invalid">
            <span *ngIf="registerForm.get('phone')?.errors?.['required']">Phone number is required.</span>
            <span *ngIf="registerForm.get('phone')?.errors?.['pattern']">Invalid phone number format.</span>
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-wrapper">
            <input [type]="showPassword ? 'text' : 'password'" id="password" formControlName="password" placeholder="Enter password" />
            <button type="button" class="toggle-password" (click)="showPassword = !showPassword" tabindex="-1">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <div class="error" *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.invalid">
            <span *ngIf="registerForm.get('password')?.errors?.['required']">Password is required.</span>
            <span *ngIf="registerForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters.</span>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <div class="password-wrapper">
            <input [type]="showConfirmPassword ? 'text' : 'password'" id="confirmPassword" formControlName="confirmPassword" placeholder="Confirm password" />
            <button type="button" class="toggle-password" (click)="showConfirmPassword = !showConfirmPassword" tabindex="-1">
              {{ showConfirmPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <div class="error" *ngIf="registerForm.get('confirmPassword')?.touched && registerForm.get('confirmPassword')?.invalid">
            <span *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">Please confirm your password.</span>
            <span *ngIf="registerForm.get('confirmPassword')?.errors?.['passwordMismatch']">Passwords do not match.</span>
          </div>
        </div>

        <button class="btn btn-primary" type="submit" [disabled]="registerForm.invalid || authService.isLoading()">
          {{ authService.isLoading() ? 'Creating Account...' : 'Create Account' }}
        </button>
        
        <div class="form-links">
          <span>Already have an account?</span>
          <a routerLink="/login">Sign in</a>
        </div>
        
        <div class="error" *ngIf="registerError">{{ registerError }}</div>
        <div class="success" *ngIf="registerSuccess">{{ registerSuccess }}</div>
      </form>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem 1rem;
    }
    .register-form {
      background: #fff;
      padding: 2.5rem 2rem;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      width: 100%;
      max-width: 450px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    h2 {
      text-align: center;
      margin-bottom: 1rem;
      color: #4f46e5;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    label {
      font-weight: 600;
      color: #333;
    }
    input[type="text"], input[type="email"], input[type="tel"], input[type="password"] {
      padding: 0.75rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 1rem;
      outline: none;
      transition: border 0.2s;
    }
    input:focus {
      border-color: #667eea;
    }
    .password-wrapper {
      display: flex;
      align-items: center;
      position: relative;
    }
    .toggle-password {
      background: none;
      border: none;
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.2rem;
      cursor: pointer;
      color: #667eea;
    }
    .btn-primary {
      background: #667eea;
      color: #fff;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s;
      margin-top: 0.5rem;
    }
    .btn-primary:disabled {
      background: #b3bcf5;
      cursor: not-allowed;
    }
    .form-links {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    .form-links span {
      color: #666;
    }
    .form-links a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }
    .form-links a:hover {
      text-decoration: underline;
    }
    .error {
      color: #e53e3e;
      font-size: 0.95rem;
      margin-top: 0.25rem;
    }
    .success {
      color: #38a169;
      font-size: 0.95rem;
      margin-top: 0.25rem;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  registerError = '';
  registerSuccess = '';

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    public authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', []],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit() {
    if (this.registerForm.invalid) return;
    
    const { name, lastName, email, phone, password } = this.registerForm.value;
    
    this.authService.register({ name, lastName, email, phone, password })
      .subscribe({
        next: (response) => {
          this.registerSuccess = 'Account created successfully! Redirecting to home...';
          this.registerError = '';
          
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.registerError = error.error?.message || 'Registration failed. Please try again.';
        }
      });
  }
} 