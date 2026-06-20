import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { GameControllerService } from '../../api/services/game-controller.service';
import { GameDto } from '../../api/models/game-dto';
import { Game } from '../../api/models/game';
import { Pageable } from '../../api/models/pageable';
import { GameCardComponent } from '../../Ecrans/game-card/game-card.component';

@Component({
  selector: 'app-newest-games',
  standalone: true,
  imports: [CommonModule, GameCardComponent],
  templateUrl: './newest-games.component.html',
  styleUrls: ['./newest-games.component.scss']
})
export class NewestGamesComponent implements OnInit {
  @Input() games$?: Observable<GameDto[]>;

  newestGames$: Observable<GameDto[]> = of([]);
  loading = true;

  constructor(private gameControllerService: GameControllerService) {}

  ngOnInit(): void {
    this.newestGames$ = this.games$ ?? this.loadNewestGames();

    this.newestGames$.subscribe({
      next: () => {
        this.loading = false;
      },
      error: (error: unknown) => {
        this.loading = false;
        console.error('Erreur lors du chargement des jeux les plus récents', error);
      }
    });
  }

  private loadNewestGames(): Observable<GameDto[]> {
    const pageable: Pageable = {
      page: 0,
      size: 4,
      sort: ['creationDate,desc']
    };

    return this.gameControllerService.getNewestGames({ pageable }).pipe(
      map((games: Game[]) => games.map(game => this.convertGameToGameDto(game))),
      catchError(error => {
        console.error('Erreur lors du chargement des jeux les plus récents', error);
        return of([]);
      })
    );
  }

  private convertGameToGameDto(game: Game): GameDto {
    return {
      id: game.id,
      name: game.name,
      url: game.url,
      description: game.description,
      category: game.category,
      difficultyLevel: game.difficultyLevel,
      imageUrl: game.imageUrl || 'assets/default-game-image.jpg',
      averageRating: game.averageRating,
      playCount: game.playCount,
      minAge: game.minAge,
      isActive: game.isActive
    };
  }
}
