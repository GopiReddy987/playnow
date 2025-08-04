import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-turf',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="turf-container">
      <h1>Turf Management</h1>
      <p>View and manage available turfs!</p>
    </div>
  `,
  styles: [`
    .turf-container {
      padding: 2rem;
      text-align: center;
    }
  `]
})
export class TurfComponent {} 