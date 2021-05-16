import { createHook } from "async_hooks";

export function asyncTrack() {
  const asyncOps = new Map();
  const asyncHook = createHook({
    init(asyncId, type, triggerAsyncId, resource) {
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
    console.log(`async: ${key} is ${type}`);
  }
}
