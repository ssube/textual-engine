import { expect } from 'chai';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError.js';
import { ActorSource } from '../../../../src/model/entity/Actor.js';
import { SignalActorGet } from '../../../../src/script/signal/actor/ActorGet.js';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity.js';
import { createTestContext, getStubHelper, match } from '../../../helper.js';

describe('actor get signal', () => {
  it('should require the script target be an actor', async () => {
    const item = makeTestItem('', '', '');
    const actor = makeTestActor('', '', '', item);

    const context = createTestContext({
      actor,
      item,
      room: makeTestRoom('', '', '', [], []),
    });

    await expect(SignalActorGet.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalActorGet.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should show the received item', async () => {
    const state = getStubHelper();

    const item = makeTestItem('', '', '');
    const actor = makeTestActor('', '', '');
    actor.source = ActorSource.PLAYER;

    const context = createTestContext({
      actor,
      item,
      room: makeTestRoom('', '', '', [], []),
      state,
    });
    await SignalActorGet.call(actor, context);

    expect(state.show).to.have.been.calledWithMatch(match.object, 'actor.signal.get.item');
  });

  it('should only show the item to player actors', async () => {
    const state = getStubHelper();

    const item = makeTestItem('', '', '');
    const actor = makeTestActor('', '', '');

    const context = createTestContext({
      actor,
      item,
      room: makeTestRoom('', '', '', [], []),
      state,
    });
    await SignalActorGet.call(actor, context);

    expect(state.show).to.have.callCount(0);
  });
});
