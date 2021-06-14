import { isNil, Optional } from '@apextoaster/js-utils';

export function debounce<TResult>(interval: number, inner: () => TResult): () => Optional<TResult> {
  let fired = false;
  let timeout: Optional<NodeJS.Timeout>;

  return function bouncer() {
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
  };
}
