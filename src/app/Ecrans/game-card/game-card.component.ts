// game-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { GameDto } from '../../api/models/game-dto'; // Ajustez le chemin si nécessaire

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss'
})
export class GameCardComponent {
  @Input() game!: GameDto;

  constructor(private router: Router) {}

  openGame(): void {
    this.router.navigate(['/Jeu', this.game.name]);
  }
}
