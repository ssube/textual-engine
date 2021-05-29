import { stub } from 'sinon';
import { StateEntityTransfer } from '../../src/util/state/EntityTransfer';
import { StateFocusResolver } from '../../src/util/state/FocusResolver';

export function testFocus(): StateFocusResolver {
  return {
    setActor: stub(),
    setRoom: stub(),
    show: stub(),
  } as any;
}

export function testTransfer(): StateEntityTransfer {
  return {
    moveActor: stub(),
    moveItem: stub(),
  } as any;
}
