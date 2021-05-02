import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, retryWhen } from 'rxjs/operators';

const getErrorMessage = (maxRetry: number) =>
  `Tried to load resource for ${maxRetry} times without success. Giving up!!!`;

const DEFAULT_MAX_RETRIES = 3;

export const delayedRetry = (
  delayMiliseconds: number,
  maxRetry = DEFAULT_MAX_RETRIES
) => {
  let retries = maxRetry;

  return (src: Observable<any>) =>
    src.pipe(
      retryWhen((errors: Observable<any>) =>
        errors.pipe(
          delay(delayMiliseconds),
          mergeMap((error) =>
            retries-- > 0 ? of(error) : throwError(getErrorMessage(maxRetry))
          )
        )
      )
    );
};
