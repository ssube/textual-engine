import { doesExist, isNil, Optional } from '@apextoaster/js-utils';

export interface ClearResult<TResult = void> {
  call: () => TResult;
  clear: () => void;
}

export function debounce(interval: number, inner: () => void): ClearResult {
  let timeout: Optional<NodeJS.Timeout>;

  function call() {
    if (doesExist(timeout)) {
      return;
    }

    timeout = setTimeout(() => {
      timeout = undefined;
      inner();
    }, interval);
  }

  // eslint-disable-next-line sonarjs/no-identical-functions
  function clear() {
    if (doesExist(timeout)) {
      clearTimeout(timeout);
    }
  }

  return { call, clear };
}

export function throttle<TResult>(interval: number, inner: () => TResult): ClearResult<Optional<TResult>> {
  let fired = false;
  let timeout: Optional<NodeJS.Timeout>;

  function call() {
    if (fired) {
      return;
    }

    if (isNil(timeout)) {
      timeout = setTimeout(() => {
        fired = false;
        timeout = undefined;
      }, interval);
    }

    fired = true;

    return inner();
  }

  // eslint-disable-next-line sonarjs/no-identical-functions
  function clear() {
    if (doesExist(timeout)) {
      clearTimeout(timeout);
    }
  }

  return { call, clear };
}
