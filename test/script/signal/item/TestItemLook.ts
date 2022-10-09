import { expect } from 'chai';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError.js';
import { makeCommand } from '../../../../src/model/Command.js';
import { SignalItemLook } from '../../../../src/script/signal/item/ItemLook.js';
import { VERB_LOOK } from '../../../../src/util/constants.js';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity.js';
import { createTestContext, getStubHelper, match } from '../../../helper.js';

describe('item look signal', () => {
  it('should require the script target be an item', async () => {

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      room: makeTestRoom('', '', '', [], []),
    });

    await expect(SignalItemLook.call(makeTestActor('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalItemLook.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should describe the item', async () => {
    const state = getStubHelper();

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      room: makeTestRoom('', '', '', [], []),
      state,
    });

    await SignalItemLook.call(makeTestItem('', '', ''), context);

    expect(state.show).to.have.been.calledWithMatch(match.object, 'item.signal.look.seen');
  });

  it('should describe whether the item is held', async () => {
    const state = getStubHelper();

    const item = makeTestItem('', '', '');
    const actor= makeTestActor('', '', '', item);
    const context = createTestContext({
      actor,
      command: makeCommand(VERB_LOOK),
      room: makeTestRoom('', '', '', [], []),
      state,
    });

    await SignalItemLook.call(item, context);

    expect(state.show).to.have.been.calledWithMatch(match.object, 'item.signal.look.held');
  });
});
