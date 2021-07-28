import { expect } from 'chai';
import { createStubInstance } from 'sinon';

import { ScriptTargetError } from '../../../../../src/error/ScriptTargetError.js';
import { makeCommand } from '../../../../../src/model/Command.js';
import { SignalBehaviorFollow } from '../../../../../src/script/signal/behavior/common/BehaviorFollow.js';
import { MathRandomService } from '../../../../../src/service/random/MathRandom.js';
import { VERB_LOOK, VERB_MOVE, VERB_WAIT } from '../../../../../src/util/constants.js';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../../entity.js';
import { createStubBehavior, createTestContext } from '../../../../helper.js';

describe('actor behavior signal for followers', () => {
  it('should require the script target be an actor', async () => {
    const room = makeTestRoom('', '', '', [], []);
    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      room,
      source: {
        room,
      },
    });

    await expect(SignalBehaviorFollow.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalBehaviorFollow.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should follow the path breadcrumbs', async () => {
    const room = makeTestRoom('bar', 'Bar', '');
    room.flags.set('foo-path', 'next');

    const random = createStubInstance(MathRandomService);
    random.nextFloat.returns(0.5);
    random.nextInt.returns(0);

    const behavior = createStubBehavior();
    const context = createTestContext({
      behavior,
      command: makeCommand(VERB_LOOK),
      random,
      room,
      source: {
        room,
      },
    });

    const actor = makeTestActor('', '', '');
    actor.flags.set('follow', 'foo-path');

    await SignalBehaviorFollow.call(actor, context);

    expect(behavior.queue).to.have.callCount(1).and.been.calledWith(actor, makeCommand(VERB_MOVE, 'next'));
  });

  it('should defer to enemy behavior when there is no breadcrumb', async () => {
    const random = createStubInstance(MathRandomService);
    random.nextFloat.returns(0.5);
    random.nextInt.returns(0);

    const behavior = createStubBehavior();
    const room = makeTestRoom('bar', 'Bar', '');
    const context = createTestContext({
      behavior,
      command: makeCommand(VERB_LOOK),
      random,
      room,
      source: {
        room,
      },
    });

    const actor = makeTestActor('', '', '');
    actor.flags.set('follow', 'foo-path');

    await SignalBehaviorFollow.call(actor, context);

    expect(behavior.queue).to.have.callCount(1).and.been.calledWith(actor, makeCommand(VERB_WAIT));
  });

  it('should defer to enemy behavior when there is no path', async () => {
    const room = makeTestRoom('bar', 'Bar', '');
    room.flags.set('foo-path', 'next');

    const random = createStubInstance(MathRandomService);
    random.nextFloat.returns(0.5);
    random.nextInt.returns(0);

    const behavior = createStubBehavior();
    const context = createTestContext({
      behavior,
      command: makeCommand(VERB_LOOK),
      random,
      room,
      source: {
        room,
      },
    });

    const actor = makeTestActor('', '', '');
    await SignalBehaviorFollow.call(actor, context);

    expect(behavior.queue).to.have.callCount(1).and.been.calledWith(actor, makeCommand(VERB_WAIT));
  });
});
