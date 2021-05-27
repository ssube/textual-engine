import { stub } from 'sinon';

import { ScriptFocus, ScriptTransfer } from '../../src/service/script';

export function testFocus(): ScriptFocus {
  return {
    setActor: stub(),
    setRoom: stub(),
    show: stub(),
  };
}

export function testTransfer(): ScriptTransfer {
  return {
    moveActor: stub(),
    moveItem: stub(),
  };
}
