import { doesExist } from '@apextoaster/js-utils';
import { EventEmitter } from 'events';

export interface RemoveResult<TValue> {
  pending: Promise<TValue>;
  remove: () => void;
}

/**
 * Wait for an event to fire once, then remove listeners. Provides a function to cleanup listeners early.
 */
export function onceWithRemove<TValue>(emitter: EventEmitter, event: string, inner?: () => void): RemoveResult<TValue> {
  let error: (err?: Error) => void;
  let result: (value: TValue) => void;

  // to resolve everything correctly, settled must be set before remove, and remove must be called before res/rej
  let settled = false;

  const pending = new Promise<TValue>((res, rej) => {
    error = (err?: Error) => {
      settled = true;
      remove();
      rej(err);
    };

    result = (value: TValue) => {
      settled = true;
      remove();
      res(value);
    };

    emitter.once('error', error);
    emitter.once(event, result);

    if (doesExist(inner)) {
      inner();
    }
  });

  const remove = () => {
    emitter.removeListener('error', error);
    emitter.removeListener(event, result);

    if (settled === false) {
      error(/* TODO: throw event aborted error */);
    }
  };

  return {
    pending,
    remove,
  };
}
