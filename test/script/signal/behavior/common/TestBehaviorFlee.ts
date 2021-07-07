import { expect } from 'chai';
import { createStubInstance, SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../../src/model/Command';
import { SignalBehaviorFlee } from '../../../../../src/script/signal/behavior/common/BehaviorFlee';
import { MathRandomService } from '../../../../../src/service/random/MathRandom';
import { VERB_LOOK, VERB_MOVE, VERB_WAIT } from '../../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestPortal, makeTestRoom } from '../../../../entity';
import { createStubBehavior, createTestContext, getStubHelper } from '../../../../helper';

describe('actor behavior signal for fleeing critters', () => {
  it('should require the script target be an actor', async () => {
    const room = makeTestRoom('', '', '', [], []);
    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      room,
      source: {
        room,
      },
    });

    await expect(SignalBehaviorFlee.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalBehaviorFlee.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should move away from flagged actors', async () => {
    const enemy = makeTestActor('foo-1', 'Foo', '');
    const portal = makeTestPortal('door', 'Door', '', '', 'dest');
    const room = makeTestRoom('bar', 'Bar', '', [enemy], [], [portal]);

    const random = createStubInstance(MathRandomService);
    random.nextFloat.returns(0.5);
    random.nextInt.returns(0);

    const behavior = createStubBehavior();
    const state = getStubHelper();
    (state.find as SinonStub).resolves([enemy]);

    const context = createTestContext({
      behavior,
      command: makeCommand(VERB_LOOK),
      random,
      room,
      source: {
        room,
      },
      state,
    });

    const actor = makeTestActor('', '', '');
    actor.flags.set('flee', 'foo');

    await SignalBehaviorFlee.call(actor, context);

    expect(behavior.queue).to.have.callCount(1).and.been.calledWith(actor, makeCommand(VERB_MOVE, portal.meta.name));
  });

  it('should defer to enemy behavior when there are no flagged actors', async () => {
    const portal = makeTestPortal('door', 'Door', '', '', 'dest');
    const room = makeTestRoom('bar', 'Bar', '', [], [], [portal]);

    const random = createStubInstance(MathRandomService);
    random.nextFloat.returns(0.5);
    random.nextInt.returns(0);

    const behavior = createStubBehavior();
    const state = getStubHelper();
    (state.find as SinonStub).resolves([]);

    const context = createTestContext({
      behavior,
      command: makeCommand(VERB_LOOK),
      random,
      room,
      source: {
        room,
      },
      state,
    });

    const actor = makeTestActor('', '', '');
    actor.flags.set('flee', 'foo');

    await SignalBehaviorFlee.call(actor, context);

    expect(behavior.queue).to.have.callCount(1).and.been.calledWith(actor, makeCommand(VERB_WAIT));
  });
});
