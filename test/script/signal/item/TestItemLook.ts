import { expect } from 'chai';
import { createStubInstance, match } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../src/model/Command';
import { SignalItemLook } from '../../../../src/script/signal/item/ItemLook';
import { MathRandomService } from '../../../../src/service/random/MathRandom';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { VERB_LOOK } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity';
import { createTestContext, getStubHelper } from '../../../helper';

describe('item look signal', () => {
  it('should require the script target be an item', async () => {
    const script = createStubInstance(LocalScriptService);
    const state = getStubHelper();

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      random: createStubInstance(MathRandomService),
      room: makeTestRoom('', '', '', [], []),
      script,
      state,
    });

    await expect(SignalItemLook.call(makeTestActor('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalItemLook.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should describe the item', async () => {
    const script = createStubInstance(LocalScriptService);
    const state = getStubHelper();

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      random: createStubInstance(MathRandomService),
      room: makeTestRoom('', '', '', [], []),
      script,
      state,
    });

    await SignalItemLook.call(makeTestItem('', '', ''), context);

    expect(state.show).to.have.been.calledWithMatch(match.object, 'actor.step.look.item.seen');
  });
});
