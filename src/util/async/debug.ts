import { AsyncHook, createHook } from 'async_hooks';
import { EventEmitter } from 'events';

import { EVENT_NAMES } from '../constants';

export function asyncTrack(): {
  asyncHook: AsyncHook;
  asyncOps: Map<number, string>;
} {
  const asyncOps = new Map();
  const asyncHook = createHook({
    init(asyncId, type, _triggerAsyncId, _resource) {
      asyncOps.set(asyncId, type);
    },
    destroy(asyncId) {
      asyncOps.delete(asyncId);
    },
    promiseResolve(asyncId) {
      asyncOps.delete(asyncId);
    },
  });

  return {
    asyncHook,
    asyncOps,
  };
}

export function asyncDebug(asyncOps: Map<number, string>): void {
  for (const [key, type] of asyncOps) {
    // eslint-disable-next-line no-console
    console.log(`async: ${key} is ${type}`);
  }
}

export function eventDebug(events: EventEmitter): void {
  for (const event of EVENT_NAMES) {
    const listeners = events.listeners(event);
    console.log(`${listeners.length} listeners for ${event}`, listeners);
  }
}
