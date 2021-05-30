import { stub } from 'sinon';

import { StateEntityTransfer } from '../../src/util/state/EntityTransfer';

export function testTransfer(): StateEntityTransfer {
  return {
    moveActor: stub(),
    moveItem: stub(),
  } as any;
}
