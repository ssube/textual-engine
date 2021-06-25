import { expect } from 'chai';
import { createStubInstance, match } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../src/model/Command';
import { SignalItemUse } from '../../../../src/script/signal/item/ItemUse';
import { MathRandomService } from '../../../../src/service/random/MathRandom';
import { VERB_WAIT } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity';
import { createTestContext, getStubHelper } from '../../../helper';

describe('item use signal', () => {
  it('should require the script target be an item', async () => {
    const context = createTestContext({
      command: makeCommand(VERB_WAIT),
      room: makeTestRoom('', '', '', [], []),
    });

    await expect(SignalItemUse.call(makeTestActor('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalItemUse.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should show a message to the using actor', async () => {
    const state = getStubHelper();
    const context = createTestContext({
      actor: makeTestActor('', '', ''),
      command: makeCommand(VERB_WAIT),
      random: createStubInstance(MathRandomService),
      room: makeTestRoom('', '', '', [], []),
      state,
    });

    await SignalItemUse.call(makeTestItem('', '', ''), context);

    expect(state.show).to.have.callCount(1).and.been.calledWithMatch(match.object, 'item.use.any');
  });
});
