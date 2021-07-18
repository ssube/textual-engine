import { doesExist, Optional } from '@apextoaster/js-utils';

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
      timeout = undefined;
    }
  }

  return { call, clear };
}

export function throttle<TResult>(interval: number, inner: () => TResult): ClearResult<Optional<TResult>> {
  let timeout: Optional<NodeJS.Timeout>;

  function call() {
    if (doesExist(timeout)) {
      return;
    }

    timeout = setTimeout(() => {
      timeout = undefined;
    }, interval);

    return inner();
  }

  // eslint-disable-next-line sonarjs/no-identical-functions
  function clear() {
    if (doesExist(timeout)) {
      clearTimeout(timeout);
      timeout = undefined;
    }
  }

  return { call, clear };
}
