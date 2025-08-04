import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Player {
  id: string;
  name: string;
  isRegistered: boolean;
}

interface Team {
  name: string;
  players: Player[];
}

@Component({
  selector: 'app-match-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './match-setup.component.html',
  styleUrl: './match-setup.component.scss'
})
export class MatchSetupComponent implements OnInit {
  setupForm!: FormGroup;
  teamA: Team = { name: 'Team A', players: [] };
  teamB: Team = { name: 'Team B', players: [] };
  oversOptions = [6, 8, 10, 12, 15, 20];
  tossWinner: string = '';
  battingFirst: string = '';
  showTossResult = false;
  isLoading = false;

  // Mock registered users (in real app, fetch from backend)
  registeredUsers: Player[] = [
    { id: '1', name: 'Gopi', isRegistered: true },
    { id: '2', name: 'Rahul', isRegistered: true },
    { id: '3', name: 'Vikram', isRegistered: true },
    { id: '4', name: 'Suresh', isRegistered: true },
    { id: '5', name: 'Arun', isRegistered: true },
    { id: '6', name: 'Kiran', isRegistered: true },
    { id: '7', name: 'Mohan', isRegistered: true },
    { id: '8', name: 'Rajesh', isRegistered: true },
    { id: '9', name: 'Prakash', isRegistered: true },
    { id: '10', name: 'Dinesh', isRegistered: true },
    { id: '11', name: 'Srinivas', isRegistered: true },
    { id: '12', name: 'Venkat', isRegistered: true },
    { id: '13', name: 'Kumar', isRegistered: true },
    { id: '14', name: 'Ravi', isRegistered: true }
  ];

  // Default team names for random assignment
  defaultTeamNames = [
    'Team Rocket', 'Smashers', 'Thunder', 'Lightning', 'Warriors', 
    'Champions', 'Legends', 'Heroes', 'Stars', 'Dynamos'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.assignRandomTeamNames();
  }

  initForm(): void {
    this.setupForm = this.fb.group({
      overs: [10, Validators.required],
      teamAName: ['', Validators.required],
      teamBName: ['', Validators.required],
      tossWinner: ['', Validators.required],
      battingFirst: ['', Validators.required]
    });
  }

  assignRandomTeamNames(): void {
    const randomIndex1 = Math.floor(Math.random() * this.defaultTeamNames.length);
    let randomIndex2 = Math.floor(Math.random() * this.defaultTeamNames.length);
    while (randomIndex2 === randomIndex1) {
      randomIndex2 = Math.floor(Math.random() * this.defaultTeamNames.length);
    }
    
    this.teamA.name = this.defaultTeamNames[randomIndex1];
    this.teamB.name = this.defaultTeamNames[randomIndex2];
    
    this.setupForm.patchValue({
      teamAName: this.teamA.name,
      teamBName: this.teamB.name
    });
  }

  addPlayerToTeam(team: 'A' | 'B', playerName: string): void {
    if (!playerName.trim()) return;
    
    const player: Player = {
      id: Date.now().toString(),
      name: playerName.trim(),
      isRegistered: false
    };

    if (team === 'A') {
      if (this.teamA.players.length < 7) {
        this.teamA.players.push(player);
      }
    } else {
      if (this.teamB.players.length < 7) {
        this.teamB.players.push(player);
      }
    }
  }

  addRegisteredPlayerToTeam(team: 'A' | 'B', player: Player): void {
    if (team === 'A') {
      if (this.teamA.players.length < 7 && !this.teamA.players.find(p => p.id === player.id)) {
        this.teamA.players.push({ ...player });
      }
    } else {
      if (this.teamB.players.length < 7 && !this.teamB.players.find(p => p.id === player.id)) {
        this.teamB.players.push({ ...player });
      }
    }
  }

  removePlayerFromTeam(team: 'A' | 'B', playerId: string): void {
    if (team === 'A') {
      this.teamA.players = this.teamA.players.filter(p => p.id !== playerId);
    } else {
      this.teamB.players = this.teamB.players.filter(p => p.id !== playerId);
    }
  }

  flipToss(): void {
    const teams = [this.teamA.name, this.teamB.name];
    this.tossWinner = teams[Math.floor(Math.random() * teams.length)];
    this.battingFirst = this.tossWinner;
    this.showTossResult = true;
    
    this.setupForm.patchValue({
      tossWinner: this.tossWinner,
      battingFirst: this.battingFirst
    });
  }

  canStartMatch(): boolean {
    return this.teamA.players.length >= 5 && 
           this.teamB.players.length >= 5 && 
           this.setupForm.valid &&
           this.showTossResult;
  }

  startMatch(): void {
    if (!this.canStartMatch()) return;

    this.isLoading = true;
    
    // Prepare match data
    const matchData = {
      id: 'match_' + Date.now(),
      overs: this.setupForm.value.overs,
      teamA: {
        name: this.setupForm.value.teamAName,
        players: this.teamA.players
      },
      teamB: {
        name: this.setupForm.value.teamBName,
        players: this.teamB.players
      },
      tossWinner: this.setupForm.value.tossWinner,
      battingFirst: this.setupForm.value.battingFirst,
      createdAt: new Date().toISOString()
    };

    // Store match data (in real app, send to backend)
    localStorage.setItem('currentMatch', JSON.stringify(matchData));
    
    // Navigate to live match
    setTimeout(() => {
      this.router.navigate(['/live-match', matchData.id]);
      this.isLoading = false;
    }, 1000);
  }

  getAvailablePlayers(team: 'A' | 'B'): Player[] {
    const currentTeamPlayers = team === 'A' ? this.teamA.players : this.teamB.players;
    return this.registeredUsers.filter(user => 
      !currentTeamPlayers.find(p => p.id === user.id)
    );
  }
}
