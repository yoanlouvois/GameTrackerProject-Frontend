import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { GameControllerService } from '../../api/services/game-controller.service';
import { GameDto } from '../../api/models/game-dto';
import { Game } from '../../api/models/game';
import { Pageable } from '../../api/models/pageable';
import { NewestGamesComponent } from '../../Components/newest-games/newest-games.component';

@Component({
  selector: 'app-ecran-accueil',
  templateUrl: './ecran-accueil.html',
  standalone: true,
  imports: [
    CommonModule,
    NewestGamesComponent
  ],
  styleUrls: ['./ecran-accueil.scss']
})
export class EcranAccueil implements OnInit {
  newestGames$: Observable<GameDto[]> = of([]);

  constructor(private gameControllerService: GameControllerService) {}

  ngOnInit(): void {
    const pageable: Pageable = {
      page: 0,
      size: 4,
      sort: ['creationDate,desc']
    };

    this.newestGames$ = this.gameControllerService.getNewestGames({ pageable }).pipe(
      map((games: Game[]) => games.map(game => this.convertGameToGameDto(game))),
      catchError(error => {
        console.error('Erreur lors du chargement des jeux récents', error);
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
