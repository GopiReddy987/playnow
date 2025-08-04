import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="team-container">
      <h1>Team Management</h1>
      <p>Manage your teams and players here!</p>
    </div>
  `,
  styles: [`
    .team-container {
      padding: 2rem;
      text-align: center;
    }
  `]
})
export class TeamComponent {} 