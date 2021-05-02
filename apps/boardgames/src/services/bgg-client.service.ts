import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import {
  catchError,
  retry,
  shareReplay,
  switchMap,
  take,
} from 'rxjs/operators';
import { delayedRetry } from '../helpers';
import { Boardgame } from '../models';

@Injectable()
export class BggClientService {
  constructor(private http: HttpClient) {}

  public loadBoardgames(url: string): Observable<Boardgame[]> {
    return this.http
      .request('GET', url, {
        observe: 'response',
        // responseType: 'text',
      })
      .pipe(
        delayedRetry(1000, 2),
        switchMap(
          (response): Observable<Boardgame[]> => {
            if (response.status === 202) {
              console.log('BGG Processing!');
              retry(1);
            }

            console.log(response);

            if (response.status === 200) {
              console.log(response.body);
              const xmlParser = new DOMParser();

              const xmlDoc = xmlParser.parseFromString(
                response.body.toString(),
                'text/xml'
              );
              const items = xmlDoc.getElementsByTagName('item');

              let games: Array<Boardgame> = [];

              for (let index = 0; index < items.length; index++) {
                const name = items[index].getElementsByTagName('name')[0]
                  ?.innerHTML;
                const year = items[index].getElementsByTagName(
                  'yearpublished'
                )[0]?.innerHTML;
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
          }
        ),
        catchError((errors) => {
          console.log(errors);
          return EMPTY;
        }),
        shareReplay(),
        take(1)
      );
  }
}
