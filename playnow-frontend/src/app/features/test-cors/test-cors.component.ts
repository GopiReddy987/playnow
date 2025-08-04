import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test-cors',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-cors">
      <h2>CORS Test</h2>
      <button (click)="testMatches()">Test Matches API</button>
      <button (click)="testCors()">Test CORS Endpoint</button>
      <button (click)="testAuthRegister()">Test Auth Register</button>
      <div *ngIf="result" class="result">
        <h3>Result:</h3>
        <pre>{{ result | json }}</pre>
      </div>
      <div *ngIf="error" class="error">
        <h3>Error:</h3>
        <pre>{{ error }}</pre>
      </div>
    </div>
  `,
  styles: [`
    .test-cors {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }
    .result, .error {
      margin-top: 20px;
      padding: 10px;
      border-radius: 4px;
    }
    .result {
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
    }
    .error {
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
    }
    button {
      margin: 5px;
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background-color: #0056b3;
    }
  `]
})
export class TestCorsComponent implements OnInit {
  result: any = null;
  error: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  testMatches() {
    this.result = null;
    this.error = '';
    
    this.http.get('http://localhost:5048/api/matches')
      .subscribe({
        next: (data) => {
          this.result = data;
          console.log('Matches API test successful:', data);
        },
        error: (err) => {
          this.error = JSON.stringify(err, null, 2);
          console.error('Matches API test failed:', err);
        }
      });
  }

  testCors() {
    this.result = null;
    this.error = '';
    
    this.http.get('http://localhost:5048/api/matches/test')
      .subscribe({
        next: (data) => {
          this.result = data;
          console.log('CORS test successful:', data);
        },
        error: (err) => {
          this.error = JSON.stringify(err, null, 2);
          console.error('CORS test failed:', err);
        }
      });
  }

  testAuthRegister() {
    this.result = null;
    this.error = '';
    
    const testPayload = {
      email: 'test@example.com',
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '1234567890',
      address: ''
    };
    
    console.log('Testing auth register with payload:', testPayload);
    
    this.http.post('http://localhost:5048/api/auth/register', testPayload)
      .subscribe({
        next: (data) => {
          this.result = data;
          console.log('Auth register test successful:', data);
        },
        error: (err) => {
          this.error = JSON.stringify(err, null, 2);
          console.error('Auth register test failed:', err);
        }
      });
  }
} 