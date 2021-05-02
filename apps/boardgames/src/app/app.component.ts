import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';
import { Boardgame } from '../models';
import { BggClientService } from '../services/bgg-client.service';

export interface BoardgameGeekConfig {
  username: string;
  own: 0 | 1;
  subtype: 'boardgame';
  excludesubtype: 'boardgame' | 'boardgameexpansion';
  stats: number;
}

@Component({
  selector: 'bgp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'Random Boardgames Picker';

  games$: Observable<Boardgame[]>;
  username: string;
  pickCount: number;
  private innerPickerButtonDisabled: boolean;

  get pickerDisabled(): boolean {
    return !this.username || !this.pickCount || this.innerPickerButtonDisabled;
  }

  pickedGames: Boardgame[];

  constructor(private bggClient: BggClientService) {}

  loadGames() {
    const options: BoardgameGeekConfig = {
      username: this.username,
      excludesubtype: 'boardgameexpansion',
      subtype: 'boardgame',
      own: 1,
      stats: 1,
    };

    const queryString = Object.keys(options).reduce(
      (query, key) => `${query}&${key}=${options[key]}`,
      ''
    );

    this.games$ = this.bggClient.loadBoardgames(
      `https://boardgamegeek.com/xmlapi2/collection?${queryString.substring(1)}`
    );
  }
}
