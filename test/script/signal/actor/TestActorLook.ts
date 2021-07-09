import { expect } from 'chai';
import { match } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../src/model/Command';
import { SignalActorLook } from '../../../../src/script/signal/actor/ActorLook';
import { STAT_HEALTH, VERB_LOOK } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity';
import { createTestContext, getStubHelper } from '../../../helper';

describe('actor look signal', () => {
  it('should require the script target be an actor', async () => {
    const state = getStubHelper();

    const room = makeTestRoom('', '', '', [], []);
    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      room,
      source: {
        room,
      },
      state,
    });

    await expect(SignalActorLook.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalActorLook.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should describe the actor', async () => {
    const state = getStubHelper();

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      room: makeTestRoom('', '', '', [], []),
      state,
    });

    const actor = makeTestActor('', '', '');
    actor.stats.set(STAT_HEALTH, 1);
    await SignalActorLook.call(actor, context);

    expect(state.show).to.have.been.calledWithMatch(match.object, 'actor.step.look.actor.seen');
  });

  it('should note if the actor is dead', async () => {
    const state = getStubHelper();

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      room: makeTestRoom('', '', '', [], []),
      state,
    });

    await SignalActorLook.call(makeTestActor('', '', ''), context);

    expect(state.show).to.have.been.calledWithMatch(match.object, 'actor.step.look.actor.seen');
  });
});
