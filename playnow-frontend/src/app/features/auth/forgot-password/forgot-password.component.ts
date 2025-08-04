import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="forgot-password-container">
      <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="forgot-password-form">
        <h2>Reset Password</h2>
        <p class="description">Enter your email address and we'll send you a link to reset your password.</p>
        
        <div class="form-group">
          <label for="email">Email Address</label>
          <input id="email" type="email" formControlName="email" placeholder="Enter your email" />
          <div class="error" *ngIf="forgotPasswordForm.get('email')?.touched && forgotPasswordForm.get('email')?.invalid">
            <span *ngIf="forgotPasswordForm.get('email')?.errors?.['required']">Email is required.</span>
            <span *ngIf="forgotPasswordForm.get('email')?.errors?.['email']">Invalid email format.</span>
          </div>
        </div>

        <button class="btn btn-primary" type="submit" [disabled]="forgotPasswordForm.invalid || authService.isLoading()">
          {{ authService.isLoading() ? 'Sending...' : 'Send Reset Link' }}
        </button>
        
        <div class="form-links">
          <a routerLink="/login">← Back to Login</a>
        </div>
        
        <div class="error" *ngIf="errorMessage">{{ errorMessage }}</div>
        <div class="success" *ngIf="successMessage">{{ successMessage }}</div>
      </form>
    </div>
  `,
  styles: [`
    .forgot-password-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem 1rem;
    }
    .forgot-password-form {
      background: #fff;
      padding: 2.5rem 2rem;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      width: 100%;
      max-width: 400px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    h2 {
      text-align: center;
      margin-bottom: 0.5rem;
      color: #4f46e5;
    }
    .description {
      text-align: center;
      color: #666;
      font-size: 0.95rem;
      margin-bottom: 1rem;
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
    input[type="email"] {
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
      margin-top: 0.5rem;
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
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    public authService: AuthService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async onSubmit() {
    if (this.forgotPasswordForm.invalid) return;
    
    this.errorMessage = '';
    this.successMessage = '';
    
    const { email } = this.forgotPasswordForm.value;
    
    try {
      const success = await this.authService.forgotPassword(email);
      
      if (success) {
        this.successMessage = 'Password reset link sent to your email! Please check your inbox.';
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      } else {
        this.errorMessage = 'Failed to send reset link. Please try again.';
      }
    } catch (error) {
      this.errorMessage = 'An error occurred. Please try again.';
    }
  }
} 