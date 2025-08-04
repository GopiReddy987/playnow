import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-join-player',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './join-player.component.html',
  styleUrl: './join-player.component.scss'
})
export class JoinPlayerComponent implements OnInit {
  joinForm!: FormGroup;
  matchId: string = '';
  spotNumber: number = 0;
  isLoading = false;

  battingStyles = [
    { value: 'right', label: 'Right Handed' },
    { value: 'left', label: 'Left Handed' }
  ];

  bowlingStyles = [
    { value: 'fast', label: 'Fast Bowler' },
    { value: 'medium', label: 'Medium Pacer' },
    { value: 'spin', label: 'Spin Bowler' },
    { value: 'legspin', label: 'Leg Spin' },
    { value: 'offspin', label: 'Off Spin' }
  ];

  bowlingHands = [
    { value: 'right', label: 'Right Arm' },
    { value: 'left', label: 'Left Arm' }
  ];

  playerRoles = [
    { value: 'batsman', label: 'Batsman' },
    { value: 'bowler', label: 'Bowler' },
    { value: 'allrounder', label: 'All Rounder' },
    { value: 'wicketkeeper', label: 'Wicket Keeper' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.matchId = params['matchId'];
      this.spotNumber = +params['spotNumber'];
    });

    this.initForm();
  }

  initForm(): void {
    this.joinForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      whatsapp: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      battingStyle: ['right', Validators.required],
      bowlingStyle: ['', Validators.required],
      bowlingHand: ['right', Validators.required],
      role: ['batsman', Validators.required],
      experience: ['', [Validators.required, Validators.min(0), Validators.max(50)]],
      preferredPosition: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.joinForm.valid) {
      this.isLoading = true;
      
      // Simulate API call
      setTimeout(() => {
        const playerData = {
          ...this.joinForm.value,
          matchId: this.matchId,
          spotNumber: this.spotNumber,
          playerId: this.generatePlayerId()
        };

        // Store player data temporarily (in real app, this would go to backend)
        localStorage.setItem('tempPlayerData', JSON.stringify(playerData));
        
        // Navigate to payment page
        this.router.navigate(['/payment', this.matchId, playerData.playerId]);
        this.isLoading = false;
      }, 1000);
    } else {
      this.markFormGroupTouched();
    }
  }

  private generatePlayerId(): string {
    return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.joinForm.controls).forEach(key => {
      const control = this.joinForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.joinForm.get(controlName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
      if (control.errors['minlength']) return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      if (control.errors['pattern']) return `Please enter a valid ${controlName}`;
      if (control.errors['min']) return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} must be at least ${control.errors['min'].min}`;
      if (control.errors['max']) return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} must be at most ${control.errors['max'].max}`;
    }
    return '';
  }
}
