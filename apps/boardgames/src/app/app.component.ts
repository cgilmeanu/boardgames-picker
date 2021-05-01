import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';
import { Boardgame } from '../models';

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

  constructor(private httpClient: HttpClient) {}

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

    this.games$ = this.loadBoardgames(
      `https://boardgamegeek.com/xmlapi2/collection?${queryString.substring(1)}`
    );
  }

  private loadBoardgames(url: string): Observable<Boardgame[]> {
    return this.httpClient
      .request('GET', url, {
        responseType: 'text',
      })
      .pipe(
        switchMap(
          (response): Observable<Boardgame[]> => {
            const xmlParser = new DOMParser();

            const xmlDoc = xmlParser.parseFromString(response, 'text/xml');
            const items = xmlDoc.getElementsByTagName('item');

            let games: Array<Boardgame> = [];

            for (let index = 0; index < items.length; index++) {
              const name = items[index].getElementsByTagName('name')[0]
                ?.innerHTML;
              const year = items[index].getElementsByTagName('yearpublished')[0]
                ?.innerHTML;
              const thumbnail = items[index].getElementsByTagName(
                'thumbnail'
              )[0]?.innerHTML;

              games = [
                ...games,
                { name, yearPublished: Number.parseInt(year), thumbnail },
              ];
            }

            return of(games);
          }
        ),
        take(1)
      );
  }
}
