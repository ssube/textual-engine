import { expect } from 'chai';
import { NullLogger } from 'noicejs';
import { createStubInstance } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../src/model/Command';
import { SignalItemLook } from '../../../../src/script/signal/item/ItemLook';
import { MathRandomGenerator } from '../../../../src/service/random/MathRandom';
import { ScriptContext } from '../../../../src/service/script';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { VERB_LOOK } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity';
import { getStubHelper } from '../../../helper';
import { testTransfer } from '../../helper';

describe('item look scripts', () => {
  it('should require the script target be an item', async () => {
    const script = createStubInstance(LocalScriptService);
    const stateHelper = getStubHelper();
    const transfer = testTransfer();

    const context: ScriptContext = {
      command: makeCommand(VERB_LOOK, ''),
      data: new Map(),
      logger: NullLogger.global,
      random: createStubInstance(MathRandomGenerator),
      room: makeTestRoom('', '', '', [], []),
      script,
      state: stateHelper,
      transfer,
    };

    await expect(SignalItemLook.call(makeTestActor('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalItemLook.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should describe the item', async () => {
    const script = createStubInstance(LocalScriptService);
    const stateHelper = getStubHelper();
    const transfer = testTransfer();

    const context: ScriptContext = {
      command: makeCommand(VERB_LOOK, ''),
      data: new Map(),
      logger: NullLogger.global,
      random: createStubInstance(MathRandomGenerator),
      room: makeTestRoom('', '', '', [], []),
      script,
      state: stateHelper,
      transfer,
    };

    await SignalItemLook.call(makeTestItem('', '', ''), context);

    expect(stateHelper.show).to.have.been.calledWith('actor.step.look.item.seen');
  });
});
