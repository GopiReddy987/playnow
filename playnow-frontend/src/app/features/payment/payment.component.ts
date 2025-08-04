import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

interface PlayerData {
  name: string;
  whatsapp: string;
  battingStyle: string;
  bowlingStyle: string;
  bowlingHand: string;
  role: string;
  experience: number;
  preferredPosition: string;
  matchId: string;
  spotNumber: number;
  playerId: string;
}

interface MatchData {
  id: string;
  sport: string;
  ground: string;
  date: string;
  time: string;
  price: number;
  players: number;
  maxPlayers: number;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent implements OnInit {
  playerData!: PlayerData;
  matchData!: MatchData;
  matchId: string = '';
  playerId: string = '';
  isLoading = false;
  paymentSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.matchId = params['matchId'];
      this.playerId = params['playerId'];
      this.loadData();
    });
  }

  loadData(): void {
    // Load player data from localStorage
    const tempPlayerData = localStorage.getItem('tempPlayerData');
    if (tempPlayerData) {
      this.playerData = JSON.parse(tempPlayerData);
    }

    // Mock match data (in real app, this would come from API)
    this.matchData = {
      id: this.matchId,
      sport: 'Cricket',
      ground: 'Central Cricket Ground',
      date: '2024-01-15',
      time: '14:00',
      price: 500,
      players: 8,
      maxPlayers: 11
    };
  }

  processPayment(): void {
    this.isLoading = true;
    
    // Simulate payment processing
    setTimeout(() => {
      this.isLoading = false;
      this.paymentSuccess = true;
      
      // Clear temporary data
      localStorage.removeItem('tempPlayerData');
      
      // In real app, you would:
      // 1. Send payment data to backend
      // 2. Update match with new player
      // 3. Send confirmation email/SMS
      // 4. Redirect to match details or dashboard
    }, 2000);
  }

  goToMatch(): void {
    this.router.navigate(['/live-match', this.matchId]);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  getBattingStyleLabel(value: string): string {
    const styles = [
      { value: 'right', label: 'Right Handed' },
      { value: 'left', label: 'Left Handed' }
    ];
    return styles.find(s => s.value === value)?.label || value;
  }

  getRoleLabel(value: string): string {
    const roles = [
      { value: 'batsman', label: 'Batsman' },
      { value: 'bowler', label: 'Bowler' },
      { value: 'allrounder', label: 'All Rounder' },
      { value: 'wicketkeeper', label: 'Wicket Keeper' }
    ];
    return roles.find(r => r.value === value)?.label || value;
  }

  getBowlingStyleLabel(value: string): string {
    const styles = [
      { value: 'fast', label: 'Fast Bowler' },
      { value: 'medium', label: 'Medium Pacer' },
      { value: 'spin', label: 'Spin Bowler' },
      { value: 'legspin', label: 'Leg Spin' },
      { value: 'offspin', label: 'Off Spin' }
    ];
    return styles.find(s => s.value === value)?.label || value;
  }

  getBowlingHandLabel(value: string): string {
    const hands = [
      { value: 'right', label: 'Right Arm' },
      { value: 'left', label: 'Left Arm' }
    ];
    return hands.find(h => h.value === value)?.label || value;
  }
}
