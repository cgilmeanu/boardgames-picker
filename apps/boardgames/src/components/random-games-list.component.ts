import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { generateRandomList } from '../helpers';
import { Boardgame } from '../models';

@Component({
  selector: 'bgp-random-games-list',
  templateUrl: './random-games-list.component.html',
  styleUrls: ['./random-games-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RandomGamesListComponent implements OnInit {
  @Input()
  games: Boardgame[];

  @Input()
  count: number;

  pickedGames: Boardgame[] = [];

  ngOnInit(): void {
    this.generateGamesPicks();
  }

  private generateGamesPicks() {
    const pickedNumbers = generateRandomList(this.count, this.games.length + 1);
    pickedNumbers.forEach(
      (index) => (this.pickedGames = [...this.pickedGames, this.games[index]])
    );
  }
}
