import { doesExist } from '@apextoaster/js-utils';
import { Logger } from 'noicejs';

import { AbortEventError } from '../../error/AbortEventError';

export type EventHandler<TEvent> = (event: TEvent) => void;
export type ErrorHandler = (err?: Error) => void;

export interface TypedEmitter<TName extends string, TValue> {
  on(name: 'error', handler: ErrorHandler): this;
  on(name: TName, handler: EventHandler<TValue>): this;

  once(name: 'error', handler: ErrorHandler): this;
  once(name: TName, handler: EventHandler<TValue>): this;

  removeListener(name: 'error', handler: ErrorHandler): this;
  removeListener(name: TName, handler: EventHandler<TValue>): this;
}

export interface RemoveResult<TValue> {
  pending: Promise<TValue>;
  remove: () => void;
}

/**
 * Wait for an event to fire once, then remove listeners. Provides a function to cleanup listeners early.
 */
export function onceWithRemove<
  TValue,
  TName extends string = string
>(emitter: TypedEmitter<TName, TValue>, event: TName, inner?: () => void): RemoveResult<TValue> {
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
      error(new AbortEventError(`unsettled listeners removed for ${event}`));
    }
  };

  return {
    pending,
    remove,
  };
}

/**
 * Wait for an event without manual cancellation.
 *
 * This wraps `onceWithRemove` to use the same removal logic on resolution/rejection, but throws away the manual
 * removal function.
 */
export function onceEvent<
  TValue,
  TName extends string = string
>(emitter: TypedEmitter<TName, TValue>, event: TName): Promise<TValue> {
  const { pending } = onceWithRemove(emitter, event);
  return pending;
}

export function catchAndLog(p: Promise<any>, logger: Logger, msg: string) {
  p.catch((err) => {
    logger.error(err, msg);
  });
}
