import { stub } from 'sinon';

import { StateEntityTransfer } from '../../src/util/entity/EntityTransfer';

export function testTransfer(): StateEntityTransfer {
  return {
    moveActor: stub(),
    moveItem: stub(),
  } as any;
}
