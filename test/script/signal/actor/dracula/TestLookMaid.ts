import { expect } from 'chai';
import type { SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../../src/error/ScriptTargetError.js';
import { makeCommand } from '../../../../../src/model/Command.js';
import { SignalActorLookMaid } from '../../../../../src/script/signal/actor/dracula/LookMaid.js';
import { VERB_LOOK } from '../../../../../src/util/constants.js';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../../entity.js';
import { createTestContext, getStubHelper } from '../../../../helper.js';

describe('actor look signal for maid characters', () => {
  it('should require the script target be an actor', async () => {
    const room = makeTestRoom('', '', '', [], []);
    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      room,
      source: {
        room,
      },
    });

    await expect(SignalActorLookMaid.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalActorLookMaid.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should wake up after some turns', async () => {
    const state = getStubHelper();
    const showStub = state.show as SinonStub;

    const room = makeTestRoom('', '', '', [], []);
    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      room,
      source: {
        room,
      },
      state,
    });

    const maid = makeTestActor('', '', '');

    maid.stats.set('awaken', 20);
    await SignalActorLookMaid.call(maid, context);
    expect(showStub).to.have.been.calledWith(context.source, 'actor.signal.look.asleep');
    showStub.resetHistory();

    maid.stats.set('awaken', 0);
    await SignalActorLookMaid.call(maid, {
      ...context,
      step: {
        time: 10,
        turn: 10,
      },
    });
    expect(showStub).to.have.been.calledWith(context.source, 'actor.signal.look.awake');
    showStub.resetHistory();
  });
});
