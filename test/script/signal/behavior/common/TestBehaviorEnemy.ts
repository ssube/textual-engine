import { expect } from 'chai';
import { createStubInstance } from 'sinon';

import { ScriptTargetError } from '../../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../../src/model/Command';
import { ActorSource } from '../../../../../src/model/entity/Actor';
import { SignalBehaviorEnemy } from '../../../../../src/script/signal/behavior/common/BehaviorEnemy';
import { MathRandomService } from '../../../../../src/service/random/MathRandom';
import { VERB_HIT, VERB_LOOK, VERB_MOVE } from '../../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestPortal, makeTestRoom } from '../../../../entity';
import { createStubBehavior, createTestContext } from '../../../../helper';

describe('actor behavior signal for common enemies', () => {
  it('should require the script target be an actor', async () => {
    const room = makeTestRoom('', '', '', [], []);
    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      room,
      source: {
        room,
      },
    });

    await expect(SignalBehaviorEnemy.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalBehaviorEnemy.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should attack any visible players', async () => {
    const player = makeTestActor('foo', 'bar', '');
    player.source = ActorSource.PLAYER;

    const room = makeTestRoom('', '', '', [player], []);

    const random = createStubInstance(MathRandomService);
    random.nextFloat.returns(0.5);

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
    actor.stats.set('attack', 1);

    await SignalBehaviorEnemy.call(actor, context);

    expect(behavior.queue).to.have.callCount(1).and.been.calledWith(actor, makeCommand(VERB_HIT, player.meta.id));
  });

  it('should wander into other rooms', async () => {
    const portal = makeTestPortal('foo', 'Foo', '', '', 'dest');
    const room = makeTestRoom('bar', 'Bar', '', [], [], [portal]);

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
    actor.stats.set('wander', 1);

    await SignalBehaviorEnemy.call(actor, context);

    expect(behavior.queue).to.have.callCount(1).and.been.calledWith(actor, makeCommand(VERB_MOVE, portal.meta.id));
  });
});
