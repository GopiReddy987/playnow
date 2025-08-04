import { Component, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { WhatsAppService } from '../../core/services/whatsapp.service';

interface Player {
  id: string;
  name: string;
  teamId: string;
  runs: number;
  balls: number;
  wickets: number;
  overs: number;
  runsGiven: number;
}

interface Team {
  id: string;
  name: string;
  score: number;
  wickets: number;
  overs: number;
  balls: number;
  color: string;
  players: Player[];
}

interface Ball {
  over: number;
  ball: number;
  bowler: string;
  batsman: string;
  runs: number;
  extras: string;
  wicket: string;
  wicketType?: string;
  timestamp: Date;
}

interface MatchData {
  id: string;
  overs: number;
  teamA: { name: string; players: Player[] };
  teamB: { name: string; players: Player[] };
  tossWinner: string;
  battingFirst: string;
  createdAt: string;
  currentInnings?: number;
  firstInnings?: {
    teamId: string;
    score: number;
    wickets: number;
    overs: number;
    balls: number;
  };
}

@Component({
  selector: 'app-live-match',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="live-match-container">
      <!-- Top Header (Match Info) -->
      <header class="match-header">
        <div class="match-info-bar">
          <div class="match-title">
            🧢 {{ teams()[0]?.name }} vs {{ teams()[1]?.name }}
          </div>
          <div class="match-status">
            <span class="over-info">🕒 Over {{ currentOver() }}.{{ currentBall() }}</span>
            <span class="target-info" *ngIf="getTarget() > 0">🎯 Target: {{ getTarget() }}</span>
          </div>
        </div>
      </header>

      <!-- Score Summary Widget (Live Top Bar) -->
      <div class="score-summary-widget">
        <div class="current-batsman">
          🏏 {{ getCurrentBatsman()?.name || 'Select Batsman' }}: {{ getCurrentBatsman()?.runs || 0 }} ({{ getCurrentBatsman()?.balls || 0 }})
        </div>
        <div class="current-bowler">
          🧤 Bowler: {{ getCurrentBowler()?.name || 'Select Bowler' }} – {{ getCurrentBowler()?.overs || 0 }}.{{ getCurrentBowler()?.balls || 0 }}-{{ getCurrentBowler()?.wickets || 0 }}-{{ getCurrentBowler()?.runsGiven || 0 }}
        </div>
        <div class="total-score">
          🧮 Total: {{ getBattingTeam()?.score || 0 }}/{{ getBattingTeam()?.wickets || 0 }} ({{ getBattingTeam()?.overs || 0 }}.{{ getBattingTeam()?.balls || 0 }}) | RR: {{ runRate() }}
        </div>
      </div>

      <!-- Ball Entry Section -->
      <div class="ball-entry-section" *ngIf="matchStatus() === 'Live'">
        <div class="ball-entry-card">
          <h3>🎯 Ball Entry</h3>
          
          <!-- Player Selection -->
          <div class="player-selection">
            <div class="player-group">
              <label>🏏 Batsman</label>
              <select [(ngModel)]="selectedBatsman" class="player-select">
                <option value="">Select Batsman</option>
                <option *ngFor="let player of getBattingTeamPlayers()" [value]="player.name">
                  {{ player.name }}
                </option>
              </select>
            </div>
            
            <div class="player-group">
              <label>🧤 Bowler</label>
              <select [(ngModel)]="selectedBowler" class="player-select">
                <option value="">Select Bowler</option>
                <option *ngFor="let player of getBowlingTeamPlayers()" [value]="player.name">
                  {{ player.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Runs Selection -->
          <div class="ball-input-group">
            <h4>🎯 Select Outcome</h4>
            <div class="run-buttons">
              <button 
                *ngFor="let run of [0, 1, 2, 3, 4, 6]" 
                class="run-btn"
                [class.active]="ballRuns === run"
                (click)="selectRuns(run)"
              >
                {{ run }}
              </button>
            </div>
          </div>

          <!-- Extras Selection -->
          <div class="ball-input-group">
            <h4>🎯 Extras</h4>
            <div class="extras-buttons">
              <button 
                *ngFor="let extra of ['Wd', 'Nb', 'Bye', 'Lb']" 
                class="extra-btn"
                [class.active]="ballExtras === extra.toLowerCase()"
                (click)="selectExtras(extra.toLowerCase())"
              >
                {{ extra }}
              </button>
            </div>
          </div>

          <!-- Wicket Selection -->
          <div class="ball-input-group">
            <h4>🎯 Wicket?</h4>
            <select [(ngModel)]="ballWicket" class="wicket-select">
              <option value="">None</option>
              <option value="bowled">Bowled</option>
              <option value="caught">Caught</option>
              <option value="lbw">LBW</option>
              <option value="run-out">Run Out</option>
              <option value="stumped">Stumped</option>
              <option value="hit-wicket">Hit Wicket</option>
            </select>
          </div>

          <!-- Ball Actions -->
          <div class="ball-actions">
            <button class="btn btn-primary" (click)="addBall()" [disabled]="!canAddBall()">
              Add Ball
            </button>
            <button class="btn btn-secondary" (click)="undoLastBall()" [disabled]="balls().length === 0">
              Undo
            </button>
          </div>
        </div>
      </div>

      <!-- Live Ball History (Mini Timeline) -->
      <div class="ball-history-section">
        <h3>📊 Ball History</h3>
        <div class="ball-timeline">
          <div class="over-group" *ngFor="let over of getOverGroups()">
            <div class="over-header">Over {{ over.overNumber }}</div>
            <div class="balls-in-over">
              <span 
                *ngFor="let ball of over.balls; let ballIndex = index" 
                class="ball-indicator"
                [class]="getBallClass(ball)"
                [title]="getBallTooltip(ball)"
              >
                {{ over.overNumber }}.{{ ballIndex + 1 }} – {{ getBallDisplay(ball) }}
                <span *ngIf="ball.wicket" class="wicket-detail">({{ ball.wicket }})</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Player Stats -->
      <div class="player-stats-section">
        <h3>👥 Player Statistics</h3>
        <div class="stats-tabs">
          <button 
            class="tab-btn" 
            [class.active]="activeStatsTab() === 'batting'"
            (click)="setActiveStatsTab('batting')"
          >
            Batting
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeStatsTab() === 'bowling'"
            (click)="setActiveStatsTab('bowling')"
          >
            Bowling
          </button>
        </div>
        
        <div class="stats-content" *ngIf="activeStatsTab() === 'batting'">
          <div class="stats-table">
            <div class="table-header">
              <span>Player</span>
              <span>Runs</span>
              <span>Balls</span>
              <span>SR</span>
            </div>
            <div class="table-row" *ngFor="let player of getBattingStats()">
              <span>{{ player.name }}</span>
              <span>{{ player.runs }}</span>
              <span>{{ player.balls }}</span>
              <span>{{ player.strikeRate }}</span>
            </div>
          </div>
        </div>
        
        <div class="stats-content" *ngIf="activeStatsTab() === 'bowling'">
          <div class="stats-table">
            <div class="table-header">
              <span>Player</span>
              <span>Overs</span>
              <span>Wickets</span>
              <span>Runs</span>
              <span>Economy</span>
            </div>
            <div class="table-row" *ngFor="let player of getBowlingStats()">
              <span>{{ player.name }}</span>
              <span>{{ player.overs }}.{{ player.balls || 0 }}</span>
              <span>{{ player.wickets }}</span>
              <span>{{ player.runsGiven }}</span>
              <span>{{ player.economy }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Match Controls -->
      <div class="match-controls">
        <div class="control-section">
          <h3>🔄 Switch Innings</h3>
          <button class="btn btn-secondary" (click)="switchInnings()">
            Switch Batting/Bowling
          </button>
        </div>
        
        <div class="control-section">
          <h3>🏁 End Match</h3>
          <button class="btn btn-primary" (click)="endMatch()">
            End Match
          </button>
        </div>
      </div>

      <!-- Match Summary -->
      <div class="match-summary" *ngIf="matchStatus() === 'Completed'">
        <h3>📋 Match Summary</h3>
        <div class="summary-content">
          <div class="result">
            <h4>🏆 Result</h4>
            <p>{{ getMatchResult() }}</p>
          </div>
          <div class="mvp-section">
            <h4>👑 MVP</h4>
            <p>{{ getMVP() }}</p>
          </div>
          <div class="actions">
            <button class="btn btn-primary" (click)="downloadSummary()">
              📥 Download Summary
            </button>
            <button class="btn btn-secondary" (click)="shareResult()">
              📤 Share Result
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .live-match-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .match-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 1rem;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .match-status {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.9rem;
      font-weight: 600;
      margin-top: 0.5rem;
    }

    .match-status.live {
      background: #28a745;
    }

    .match-status.completed {
      background: #6c757d;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .timer-section {
      background: white;
      padding: 1.5rem;
      border-radius: 1rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    .timer-display {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .timer-time {
      text-align: center;
    }

    .time {
      display: block;
      font-size: 2rem;
      font-weight: bold;
      color: #333;
    }

    .label {
      font-size: 0.9rem;
      color: #666;
    }

    .timer-controls {
      display: flex;
      gap: 0.5rem;
    }

    .toss-section {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .toss-card h3 {
      margin-bottom: 1rem;
      color: #333;
    }

    .teams-toss {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin: 2rem 0;
    }

    .team-toss {
      text-align: center;
    }

    .team-name {
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .team-color {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      margin: 0 auto;
    }

    .toss-btn {
      font-size: 1.2rem;
      padding: 1rem 2rem;
    }

    .scoreboard-section {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    .scoreboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f0f0f0;
    }

    .match-info {
      display: flex;
      gap: 1rem;
      font-size: 0.9rem;
      color: #666;
    }

    .teams-scoreboard {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
    }

    .team-card {
      border: 2px solid #e1e5e9;
      border-radius: 1rem;
      padding: 1.5rem;
      transition: all 0.3s ease;
    }

    .team-card.active {
      border-color: #667eea;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }

    .team-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .team-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .team-color {
      width: 30px;
      height: 30px;
      border-radius: 50%;
    }

    .batting-status, .bowling-status {
      font-size: 0.8rem;
      padding: 0.25rem 0.5rem;
      border-radius: 0.5rem;
      background: #28a745;
      color: white;
    }

    .bowling-status {
      background: #ffc107;
      color: #333;
    }

    .score-main {
      font-size: 2rem;
      font-weight: bold;
      color: #333;
    }

    .overs {
      font-size: 0.9rem;
      color: #666;
      text-align: center;
    }

    .match-controls {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    .control-section {
      margin-bottom: 2rem;
    }

    .control-section h3 {
      margin-bottom: 1rem;
      color: #333;
    }

    .score-inputs {
      display: flex;
      gap: 1rem;
      align-items: end;
      flex-wrap: wrap;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .input-group label {
      font-weight: 600;
      color: #333;
    }

    .score-input {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 0.5rem;
      min-width: 100px;
    }

    .match-summary {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    .summary-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 1rem;
    }

    .result h4, .stats-summary h4 {
      margin-bottom: 1rem;
      color: #333;
    }

    .stats-grid {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5a6fd8;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #5a6268;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .match-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .header-actions {
        flex-direction: column;
        width: 100%;
      }

      .timer-display {
        flex-direction: column;
        gap: 1rem;
      }

      .teams-scoreboard {
        grid-template-columns: 1fr;
      }

      .score-inputs {
        flex-direction: column;
        align-items: stretch;
      }

      .summary-content {
        grid-template-columns: 1fr;
      }

      .actions {
        flex-direction: column;
      }
    }
  `]
})
export class LiveMatchComponent implements OnDestroy {
  // Match data
  matchTitle = signal('Team A vs Team B');
  currentSport = signal('Cricket');
  matchStatus = signal<'Live' | 'Completed'>('Live');
  matchVenue = signal('Hitech Stadium, Madhapur');
  matchDate = signal('2024-01-20');
  
  // Timer
  elapsedTime = signal(0);
  isTimerRunning = signal(false);
  private timerSubscription?: Subscription;
  
  // Toss
  tossCompleted = signal(false);
  tossWinner = signal<string>('');
  
  // Teams
  teams = signal<Team[]>([
    {
      id: 'team1',
      name: 'Team A',
      score: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      color: '#667eea',
      players: []
    },
    {
      id: 'team2',
      name: 'Team B',
      score: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      color: '#ff6b6b',
      players: []
    }
  ]);
  
  // Cricket specific
  currentBattingTeam = signal('team1');
  currentBowlingTeam = signal('team2');
  totalRuns = signal(0);
  totalWickets = signal(0);
  
  // Score input
  newRuns = 0;
  wicketType = '';
  
  // New signals
  matchData = signal<MatchData | null>(null);
  balls = signal<Ball[]>([]);
  activeStatsTab = signal<'batting' | 'bowling'>('batting');
  
  // Ball entry form
  selectedBatsman: string = '';
  selectedBowler: string = '';
  ballRuns: number = 0;
  ballExtras: string = '';
  ballWicket: string = '';
  
  constructor(private route: ActivatedRoute, private whatsAppService: WhatsAppService) {
    this.route.params.subscribe(params => {
      const matchId = params['matchId'];
      this.loadMatchData(matchId);
    });
  }

  ngOnInit() {
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  loadMatchData(matchId: string) {
    // Load match data from localStorage (set by match setup)
    const matchDataStr = localStorage.getItem('currentMatch');
    if (matchDataStr) {
      const data: MatchData = JSON.parse(matchDataStr);
      this.matchData.set(data);
      
      // Initialize teams with match data
      this.initializeTeams(data);
    }
  }

  initializeTeams(data: MatchData) {
    const teamA: Team = {
      id: 'teamA',
      name: data.teamA.name,
      score: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      color: '#667eea',
      players: data.teamA.players.map(p => ({ ...p, runs: 0, balls: 0, wickets: 0, overs: 0, runsGiven: 0 }))
    };

    const teamB: Team = {
      id: 'teamB',
      name: data.teamB.name,
      score: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      color: '#764ba2',
      players: data.teamB.players.map(p => ({ ...p, runs: 0, balls: 0, wickets: 0, overs: 0, runsGiven: 0 }))
    };

    this.teams.set([teamA, teamB]);
    
    // Set batting team based on toss
    if (data.battingFirst === data.teamA.name) {
      this.currentBattingTeam.set('teamA');
      this.currentBowlingTeam.set('teamB');
    } else {
      this.currentBattingTeam.set('teamB');
      this.currentBowlingTeam.set('teamA');
    }
  }

  // Computed values
  currentOver = computed(() => {
    const totalBalls = this.balls().length;
    return Math.floor(totalBalls / 6);
  });

  currentBall = computed(() => {
    const totalBalls = this.balls().length;
    return totalBalls % 6;
  });

  totalOvers = computed(() => this.matchData()?.overs || 10);

  runRate = computed(() => {
    const battingTeam = this.teams().find(t => t.id === this.currentBattingTeam());
    if (!battingTeam || battingTeam.overs === 0) return '0.00';
    return (battingTeam.score / battingTeam.overs).toFixed(2);
  });

  // Ball entry methods
  canAddBall(): boolean {
    return !!this.selectedBowler && !!this.selectedBatsman && 
           this.currentOver() < this.totalOvers() &&
           this.teams().find(t => t.id === this.currentBattingTeam())!.wickets < 10;
  }

  addBall() {
    if (!this.canAddBall()) return;

    const ball: Ball = {
      over: this.currentOver(),
      ball: this.currentBall() + 1,
      bowler: this.selectedBowler,
      batsman: this.selectedBatsman,
      runs: this.ballRuns,
      extras: this.ballExtras,
      wicket: this.ballWicket,
      wicketType: this.ballWicket || undefined,
      timestamp: new Date()
    };

    this.balls.update(balls => [...balls, ball]);
    this.updateMatchStats(ball);
    this.resetBallForm();
  }

  updateMatchStats(ball: Ball) {
    const battingTeam = this.teams().find(t => t.id === this.currentBattingTeam())!;
    const bowlingTeam = this.teams().find(t => t.id === this.currentBowlingTeam())!;

    // Update team scores
    if (ball.wicket) {
      battingTeam.wickets++;
    } else {
      battingTeam.score += ball.runs;
    }

    // Update player stats
    this.updatePlayerStats(ball);

    // Update overs
    if (ball.ball === 6) {
      battingTeam.overs++;
      battingTeam.balls = 0;
    } else {
      battingTeam.balls = ball.ball;
    }

    // Check if innings is complete
    if (battingTeam.wickets >= 10 || battingTeam.overs >= this.totalOvers()) {
      this.switchInnings();
    }
  }

  updatePlayerStats(ball: Ball) {
    // Update batsman stats
    const battingTeam = this.teams().find(t => t.id === this.currentBattingTeam())!;
    const batsman = battingTeam.players.find(p => p.name === ball.batsman);
    if (batsman && !ball.wicket) {
      batsman.runs += ball.runs;
      batsman.balls++;
    }

    // Update bowler stats
    const bowlingTeam = this.teams().find(t => t.id === this.currentBowlingTeam())!;
    const bowler = bowlingTeam.players.find(p => p.name === ball.bowler);
    if (bowler) {
      if (ball.wicket) {
        bowler.wickets++;
      }
      bowler.runsGiven += ball.runs;
      if (ball.ball === 6) {
        bowler.overs++;
      }
    }
  }

  resetBallForm() {
    this.selectedBowler = '';
    this.selectedBatsman = '';
    this.ballRuns = 0;
    this.ballExtras = '';
    this.ballWicket = '';
  }

  undoLastBall() {
    this.balls.update(balls => balls.slice(0, -1));
    // Recalculate stats (simplified - in real app, you'd want to recalculate everything)
  }

  // Helper methods
  getBattingTeamPlayers(): Player[] {
    const team = this.teams().find(t => t.id === this.currentBattingTeam());
    return team?.players || [];
  }

  getBowlingTeamPlayers(): Player[] {
    const team = this.teams().find(t => t.id === this.currentBowlingTeam());
    return team?.players || [];
  }

  getOverGroups() {
    const groups: { overNumber: number; balls: Ball[] }[] = [];
    this.balls().forEach(ball => {
      let group = groups.find(g => g.overNumber === ball.over);
      if (!group) {
        group = { overNumber: ball.over, balls: [] };
        groups.push(group);
      }
      group.balls.push(ball);
    });
    return groups;
  }

  getBallClass(ball: Ball): string {
    if (ball.wicket) return 'wicket';
    if (ball.runs === 4) return 'four';
    if (ball.runs === 6) return 'six';
    if (ball.extras) return 'extra';
    return 'normal';
  }

  getBallDisplay(ball: Ball): string {
    if (ball.wicket) return 'W';
    if (ball.runs === 0) return '0';
    return ball.runs.toString();
  }

  getBallTooltip(ball: Ball): string {
    return `${ball.bowler} to ${ball.batsman}: ${ball.runs} runs${ball.wicket ? `, ${ball.wicket}` : ''}`;
  }

  getBattingStats() {
    const team = this.teams().find(t => t.id === this.currentBattingTeam());
    return team?.players.map(p => ({
      ...p,
      strikeRate: p.balls > 0 ? ((p.runs / p.balls) * 100).toFixed(2) : '0.00'
    })) || [];
  }

  getBowlingStats() {
    const team = this.teams().find(t => t.id === this.currentBowlingTeam());
    return team?.players.map(p => ({
      ...p,
      economy: p.overs > 0 ? (p.runsGiven / p.overs).toFixed(2) : '0.00'
    })) || [];
  }

  setActiveStatsTab(tab: 'batting' | 'bowling') {
    this.activeStatsTab.set(tab);
  }

  getMVP(): string {
    // Simple MVP calculation - highest runs + wickets
    const allPlayers = [...this.getBattingStats(), ...this.getBowlingStats()];
    const mvp = allPlayers.reduce((prev, current) => {
      const prevScore = prev.runs + (prev.wickets * 10);
      const currentScore = current.runs + (current.wickets * 10);
      return currentScore > prevScore ? current : prev;
    });
    return `${mvp.name} - ${mvp.runs} runs, ${mvp.wickets} wickets`;
  }

  // Match control methods
  endMatch() {
    this.matchStatus.set('Completed');
    this.pauseTimer();
    alert('Match ended! Check the summary below.');
  }
  
  shareMatch() {
    const message = `🏏 Live Match Update!\n\n` +
      `🎯 ${this.matchTitle()}\n` +
      `⚽ ${this.currentSport()}\n` +
      `📍 ${this.matchVenue()}\n` +
      `📅 ${this.matchDate()}\n` +
      `⏱️ ${this.formatTime(this.elapsedTime())}\n\n` +
      `📊 Current Score:\n` +
      `${this.teams()[0].name}: ${this.teams()[0].score}${this.teams()[0].wickets !== undefined ? '/' + this.teams()[0].wickets : ''}\n` +
      `${this.teams()[1].name}: ${this.teams()[1].score}${this.teams()[1].wickets !== undefined ? '/' + this.teams()[1].wickets : ''}\n\n` +
      `🎮 Watch live on PlayNow!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }
  
  getMatchResult(): string {
    const team1 = this.teams()[0];
    const team2 = this.teams()[1];
    
    if (team1.score > team2.score) {
      return `${team1.name} won by ${team1.score - team2.score} runs`;
    } else if (team2.score > team1.score) {
      return `${team2.name} won by ${team2.score - team1.score} runs`;
    } else {
      return 'Match tied!';
    }
  }
  
  downloadSummary() {
    const summary = {
      match: this.matchTitle(),
      sport: this.currentSport(),
      venue: this.matchVenue(),
      date: this.matchDate(),
      duration: this.formatTime(this.elapsedTime()),
      result: this.getMatchResult(),
      teams: this.teams()
    };
    
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `match-summary-${this.matchDate()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
  
  shareResult() {
    const message = `🏆 Match Result!\n\n` +
      `🎯 ${this.matchTitle()}\n` +
      `⚽ ${this.currentSport()}\n` +
      `📍 ${this.matchVenue()}\n` +
      `📅 ${this.matchDate()}\n` +
      `⏱️ Duration: ${this.formatTime(this.elapsedTime())}\n\n` +
      `📊 Final Score:\n` +
      `${this.teams()[0].name}: ${this.teams()[0].score}${this.teams()[0].wickets !== undefined ? '/' + this.teams()[0].wickets : ''}\n` +
      `${this.teams()[1].name}: ${this.teams()[1].score}${this.teams()[1].wickets !== undefined ? '/' + this.teams()[1].wickets : ''}\n\n` +
      `🏆 ${this.getMatchResult()}\n\n` +
      `🎮 Thanks for playing on PlayNow!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }
  
  // Timer methods
  startTimer() {
    if (!this.isTimerRunning()) {
      this.isTimerRunning.set(true);
      this.timerSubscription = interval(1000).subscribe(() => {
        this.elapsedTime.update(time => time + 1);
      });
    }
  }
  
  pauseTimer() {
    this.isTimerRunning.set(false);
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
  
  toggleTimer() {
    if (this.isTimerRunning()) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }
  
  resetTimer() {
    this.pauseTimer();
    this.elapsedTime.set(0);
  }
  
  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  // Toss methods
  performToss() {
    const winner = Math.random() < 0.5 ? this.teams()[0].id : this.teams()[1].id;
    this.tossWinner.set(winner);
    this.tossCompleted.set(true);
    
    // Set batting team based on toss
    this.currentBattingTeam.set(winner);
    this.currentBowlingTeam.set(winner === 'team1' ? 'team2' : 'team1');
    
    alert(`Toss won by ${this.getTeamName(winner)}! They chose to bat first.`);
  }
  
  // Utility methods
  getTeamName(teamId: string): string {
    return this.teams().find(t => t.id === teamId)?.name || '';
  }
  
  switchInnings() {
    const temp = this.currentBattingTeam();
    this.currentBattingTeam.set(this.currentBowlingTeam());
    this.currentBowlingTeam.set(temp);
    
    alert('Innings switched!');
  }

  // New methods for enhanced UI
  selectRuns(runs: number): void {
    this.ballRuns = runs;
  }

  selectExtras(extras: string): void {
    this.ballExtras = extras;
  }

  getCurrentBatsman(): any {
    if (!this.selectedBatsman) return null;
    return this.getBattingTeamPlayers().find(p => p.name === this.selectedBatsman);
  }

  getCurrentBowler(): any {
    if (!this.selectedBowler) return null;
    return this.getBowlingTeamPlayers().find(p => p.name === this.selectedBowler);
  }

  getTarget(): number {
    const firstInnings = this.matchData()?.firstInnings;
    if (firstInnings && this.matchData()?.currentInnings === 2) {
      return firstInnings.score + 1;
    }
    return 0;
  }

  getBattingTeam(): Team | undefined {
    return this.teams().find(t => t.id === this.currentBattingTeam());
  }

  getBowlingTeam(): Team | undefined {
    return this.teams().find(t => t.id === this.currentBowlingTeam());
  }

} 