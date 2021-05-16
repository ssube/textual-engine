import { doesExist } from '@apextoaster/js-utils';
import { EventEmitter } from 'events';

export interface RemoveResult<T> {
  pending: Promise<T>;
  remove: () => void;
}

export function onceWithRemove<TValue>(emitter: EventEmitter, event: string, inner?: () => void): RemoveResult<TValue> {
  let error: (err: Error) => void;
  let result: (value: TValue) => void;

  const remove = () => {
    emitter.removeListener('error', error);
    emitter.removeListener(event, result);
  };

  const pending = new Promise<TValue>((res, rej) => {
    error = (err: Error) => {
      remove();
      rej(err);
    };

    result = (value: TValue) => {
      remove();
      res(value);
    };

    emitter.once('error', error);
    emitter.once(event, result);

    if (doesExist(inner)) {
      inner();
    }
  });

  return {
    pending,
    remove,
  };
}
