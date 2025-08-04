import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  emailForm: FormGroup;
  loginError = '';

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    public authService: AuthService
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onEmailLogin() {
    if (this.emailForm.invalid) return;
    const { email, password } = this.emailForm.value;
    this.loginError = '';
    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.loginError = '';
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loginError = err.error?.message || 'Invalid email or password.';
      }
    });
  }
} 