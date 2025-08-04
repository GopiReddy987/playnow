import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatchService, OpenMatch } from '../../core/services/match.service';

@Component({
  selector: 'app-match-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match-details.component.html',
  styleUrl: './match-details.component.scss'
})
export class MatchDetailsComponent implements OnInit {
  match: OpenMatch | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private matchService: MatchService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.matchService.getMatchById(id).subscribe({
        next: (match) => {
          // Fix skillLevel type if needed
          if (match && typeof match.skillLevel === 'string') {
            match.skillLevel = match.skillLevel as 'Any' | 'Beginner' | 'Intermediate' | 'Advanced';
          }
          this.match = match as OpenMatch;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.router.navigate(['/join-game']);
        }
      });
    } else {
      this.isLoading = false;
      this.router.navigate(['/join-game']);
    }
  }

  getSpotsArray(maxPlayers: number): number[] {
    return Array.from({ length: maxPlayers }, (_, i) => i + 1);
  }

  getPlayerName(index: number): string {
    const names = ['Raj', 'Zoe', 'Akash'];
    return names[index] || 'Player';
  }

  getPlayerInitial(index: number): string {
    const initials = ['R', 'Z', 'A'];
    return initials[index] || '';
  }

  trackByIndex(index: number): number {
    return index;
  }
}
