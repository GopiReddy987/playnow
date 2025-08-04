import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WhatsAppService, MatchNotification } from '../../core/services/whatsapp.service';
import { MatchService, OpenMatch, PlayerRequest, CreateMatchRequest } from '../../core/services/match.service';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

interface Player {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferredSports: string[];
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
  rating: number;
  totalGames: number;
  availability: string[];
  profileImage?: string;
}

@Component({
  selector: 'app-join-game',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './join-game.component.html',
  styleUrls: ['./join-game.component.scss']
})
export class JoinGameComponent implements OnInit, OnDestroy {
  // Signals for reactive state management
  activeTab = signal<'matches' | 'requests' | 'create'>('matches');
  searchQuery = signal('');
  selectedSport = signal('');
  selectedDate = signal('');
  selectedSkill = signal('');
  showMatchModal = signal(false);
  selectedMatch = signal<OpenMatch | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // New match form data
  newMatch = {
    title: '',
    sport: '',
    matchType: '',
    date: '',
    time: '',
    duration: '',
    maxPlayers: 10,
    pricePerPlayer: 500,
    skillLevel: 'Any' as 'Any' | 'Beginner' | 'Intermediate' | 'Advanced',
    description: '',
    hostPhone: '' // Add phone field for WhatsApp notifications
  };

  private subscription = new Subscription();

  constructor(
    private router: Router,
    private whatsAppService: WhatsAppService,
    private matchService: MatchService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadMatches();
    // Commented out: this.loadPlayerRequests();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadMatches() {
    this.isLoading.set(true);
    this.error.set(null);

    this.subscription.add(
      this.matchService.loadMatches().subscribe({
        next: () => {
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading matches:', error);
          this.error.set('Failed to load matches. Please try again.');
          this.isLoading.set(false);
        }
      })
    );
  }

  // Commented out: loadPlayerRequests() {
  //   this.matchService.loadPlayerRequests().subscribe({
  //     error: (error) => {
  //       console.error('Error loading player requests:', error);
  //     }
  //   });
  // }

  // Computed properties using the service data
  filteredMatches = computed(() => {
    const matches = this.matchService.allMatches();
    let filtered = matches;

    // Apply search filter
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(match =>
        match.title.toLowerCase().includes(query) ||
        match.sport.toLowerCase().includes(query) ||
        match.turf.location.toLowerCase().includes(query)
      );
    }

    // Apply sport filter
    if (this.selectedSport()) {
      filtered = filtered.filter(match => match.sport === this.selectedSport());
    }

    // Apply date filter
    if (this.selectedDate()) {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      switch (this.selectedDate()) {
        case 'today':
          filtered = filtered.filter(match => match.date === today);
          break;
        case 'tomorrow':
          filtered = filtered.filter(match => match.date === tomorrow);
          break;
        case 'weekend':
          // Filter for weekend dates (Saturday and Sunday)
          filtered = filtered.filter(match => {
            const matchDate = new Date(match.date);
            const day = matchDate.getDay();
            return day === 0 || day === 6; // Sunday = 0, Saturday = 6
          });
          break;
      }
    }

    // Apply skill level filter
    if (this.selectedSkill()) {
      filtered = filtered.filter(match => 
        match.skillLevel === this.selectedSkill() || match.skillLevel === 'Any'
      );
    }

    return filtered;
  });

  filteredRequests = computed(() => {
    const requests = this.matchService.allPlayerRequests();
    let filtered = requests;

    // Apply search filter
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(request =>
        request.teamName.toLowerCase().includes(query) ||
        request.sport.toLowerCase().includes(query) ||
        request.turf.toLowerCase().includes(query)
      );
    }

    return filtered;
  });

  get today(): string {
    return new Date().toISOString().split('T')[0];
  }

  setActiveTab(tab: 'matches' | 'requests' | 'create') {
    this.activeTab.set(tab);
  }

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  clearSearch() {
    this.searchQuery.set('');
  }

  applyFilters() {
    // Filters are applied automatically through computed properties
  }

  onSportChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedSport.set(target.value);
  }

  onDateFilterChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedDate.set(target.value);
  }

  onSkillLevelChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedSkill.set(target.value);
  }

  joinMatch(match: OpenMatch) {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading.set(true);
    this.subscription.add(
      this.matchService.joinMatch(match.id).subscribe({
        next: () => {
          // Show success message
          alert('Successfully joined the match!');
          this.isLoading.set(false);
          this.router.navigate(['/match-details', match.id]);
        },
        error: (error) => {
          console.error('Error joining match:', error);
          alert('Failed to join match. Please try again.');
          this.isLoading.set(false);
        }
      })
    );
  }

  viewMatchDetails(match: OpenMatch) {
    this.router.navigate(['/match-details', match.id]);
  }

  closeMatchModal() {
    this.showMatchModal.set(false);
    this.selectedMatch.set(null);
  }

  contactTeam(request: PlayerRequest) {
    // Implement contact functionality
    console.log('Contacting team:', request.teamName);
  }

  viewRequestDetails(request: PlayerRequest) {
    // Implement view details functionality
    console.log('Viewing request details:', request);
  }

  createMatch() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    const matchData: CreateMatchRequest = {
      title: this.newMatch.title,
      sport: this.newMatch.sport,
      matchType: this.newMatch.matchType,
      date: this.newMatch.date,
      time: this.newMatch.time,
      duration: this.newMatch.duration,
      maxPlayers: this.newMatch.maxPlayers,
      pricePerPlayer: this.newMatch.pricePerPlayer,
      skillLevel: this.newMatch.skillLevel,
      description: this.newMatch.description,
      hostPhone: this.newMatch.hostPhone
    };

    this.isLoading.set(true);
    this.subscription.add(
      this.matchService.createMatch(matchData).subscribe({
        next: (response) => {
          alert('Match created successfully!');
          this.setActiveTab('matches');
          this.resetForm();
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error creating match:', error);
          alert('Failed to create match. Please try again.');
          this.isLoading.set(false);
        }
      })
    );
  }

  resetForm() {
    this.newMatch = {
      title: '',
      sport: '',
      matchType: '',
      date: '',
      time: '',
      duration: '',
      maxPlayers: 10,
      pricePerPlayer: 500,
      skillLevel: 'Any',
      description: '',
      hostPhone: ''
    };
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  startLiveMatch(match: OpenMatch) {
    this.router.navigate(['/live-match', match.id]);
  }

  canStartLiveMatch(match: OpenMatch): boolean {
    if (match.status !== 'Full') return false;
    
    const matchTime = new Date(`${match.date}T${match.time}`);
    const now = new Date();
    const timeDiff = matchTime.getTime() - now.getTime();
    
    // Can start 30 minutes before match time
    return timeDiff <= 30 * 60 * 1000 && timeDiff > -2 * 60 * 60 * 1000; // Within 2 hours after start
  }

  isWithinMatchTime(match: OpenMatch): boolean {
    const matchTime = new Date(`${match.date}T${match.time}`);
    const now = new Date();
    const timeDiff = matchTime.getTime() - now.getTime();
    
    return timeDiff <= 0 && timeDiff > -2 * 60 * 60 * 1000; // Within 2 hours after start
  }

  shareMatchCreation() {
    const matchNotification: MatchNotification = {
      matchTitle: this.newMatch.title,
      sport: this.newMatch.sport,
      turf: 'Your Selected Turf',
      date: this.newMatch.date,
      time: this.newMatch.time,
      duration: this.newMatch.duration,
      hostName: 'You',
      playersNeeded: this.newMatch.maxPlayers - 1,
      pricePerPlayer: this.newMatch.pricePerPlayer,
      matchId: 'preview'
    };

    const shareUrl = this.whatsAppService.getMatchShareUrl(matchNotification);
    window.open(shareUrl, '_blank');
  }

  onSpotClick(match: OpenMatch, spotNumber: number) {
    if (spotNumber > match.playersJoined && match.status === 'Open') {
      this.joinMatch(match);
    }
  }

  retryLoad() {
    this.loadMatches();
    // Commented out: this.loadPlayerRequests();
  }

  trackByIndex(index: number): number {
    return index;
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
} 