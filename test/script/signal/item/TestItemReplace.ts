import { expect } from 'chai';
import { createStubInstance } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { ACTOR_TYPE, ITEM_TYPE } from '../../../../src/lib';
import { makeCommand } from '../../../../src/model/Command';
import { SignalItemReplace } from '../../../../src/script/signal/item/ItemReplace';
import { MathRandomService } from '../../../../src/service/random/MathRandom';
import { VERB_WAIT } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity';
import { createTestContext, getStubHelper } from '../../../helper';

describe('item replace signal', () => {
  it('should require the script target be an item', async () => {
    const context = createTestContext({
      command: makeCommand(VERB_WAIT),
      room: makeTestRoom('', '', '', [], []),
    });

    await expect(SignalItemReplace.call(makeTestActor('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalItemReplace.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should create each entity in the replace flag', async () => {
    const state = getStubHelper();
    const context = createTestContext({
      actor: makeTestActor('', '', ''),
      command: makeCommand(VERB_WAIT),
      random: createStubInstance(MathRandomService),
      room: makeTestRoom('', '', '', [], []),
      state,
    });

    const item = makeTestItem('', '', '');
    item.flags.set('replace', '(actor:foo|item:bar)');

    await SignalItemReplace.call(item, context);

    expect(state.create).to.have.callCount(2)
      .and.been.calledWith('foo', ACTOR_TYPE)
      .and.been.calledWith('bar', ITEM_TYPE);
  });
});
