import { expect } from 'chai';
import sinon from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError.js';
import { makeCommand } from '../../../../src/model/Command.js';
import { CoreModule } from '../../../../src/module/CoreModule.js';
import { SignalActorLook } from '../../../../src/script/signal/actor/ActorLook.js';
import { LocalScriptService } from '../../../../src/service/script/LocalScript.js';
import { SIGNAL_LOOK, STAT_HEALTH, VERB_LOOK } from '../../../../src/util/constants.js';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity.js';
import { createTestContext, getStubHelper, getTestContainer } from '../../../helper.js';

const { stub } = sinon;

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

    expect(state.show).to.have.been.calledWith(context.source, 'actor.signal.look.seen');
  });

  it('should note if the actor is dead', async () => {
    const state = getStubHelper();

    const actor = makeTestActor('', '', '');
    const context = createTestContext({
      actor,
      command: makeCommand(VERB_LOOK),
      room: makeTestRoom('', '', '', [], []),
      state,
    });

    await SignalActorLook.call(actor, context);

    expect(state.show).to.have.callCount(2);
    expect(state.show).to.have.been.calledWith(context.source, 'actor.signal.look.self');
    expect(state.show).to.have.been.calledWith(context.source, 'actor.signal.look.dead');
  });

  it('should describe inventory items', async () => {
    const container = await getTestContainer(new CoreModule());

    const items = [
      makeTestItem('foo-1', 'foo bob', ''),
      makeTestItem('foo-2', 'foo bin', ''),
      makeTestItem('bar-1', 'bar bin', ''),
    ];

    const actor = makeTestActor('', '', '', ...items);
    actor.stats.set(STAT_HEALTH, 1);

    const script = await container.create(LocalScriptService);
    const invokeStub = stub(script, 'invoke');

    const state = getStubHelper();
    const context = createTestContext({
      actor,
      command: makeCommand(VERB_LOOK),
      room: makeTestRoom('', '', '', [], []),
      script,
      state,
    });

    await SignalActorLook.call(actor, context);

    for (const item of items) {
      expect(invokeStub, item.meta.id).to.have.been.calledWith(item, SIGNAL_LOOK, context);
    }
  });
});
