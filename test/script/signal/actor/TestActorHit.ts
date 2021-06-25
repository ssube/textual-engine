import { expect } from 'chai';
import { createStubInstance, match, SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { SignalActorHit } from '../../../../src/script/signal/actor/ActorHit';
import { MathRandomService } from '../../../../src/service/random/MathRandom';
import { STAT_DAMAGE, STAT_HEALTH } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity';
import { createTestContext, getStubHelper } from '../../../helper';

describe('actor hit signal', () => {
  it('should remove some health', async () => {
    const item = makeTestItem('', '', '');
    item.stats.set(STAT_DAMAGE, 5);

    const actor = makeTestActor('', '', '');
    actor.stats.set(STAT_DAMAGE, 5);
    actor.stats.set(STAT_HEALTH, 10);

    const random = createStubInstance(MathRandomService);
    random.nextInt.returnsArg(0); // do max damage, 5 + 5

    const context = createTestContext({
      actor,
      item,
      random,
      room: makeTestRoom('', '', ''),
    });

    await SignalActorHit.call(actor, context);

    expect(actor.stats.get(STAT_HEALTH)).to.equal(0);
  });

  it('should require the script target be an actor', async () => {
    const item = makeTestItem('', '', '');
    const actor = makeTestActor('', '', '', item);

    const context = createTestContext({
      actor,
      item,
    });

    await expect(SignalActorHit.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalActorHit.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should show the resulting health', async () => {
    const item = makeTestItem('', '', '');
    const actor = makeTestActor('', '', '', item);
    actor.stats.set(STAT_HEALTH, 100);

    const stateHelper = getStubHelper();
    const context = createTestContext({
      actor,
      item,
      room: makeTestRoom('', '', '', [], []),
      state: stateHelper,
    });

    await SignalActorHit.call(actor, context);

    const showStub = stateHelper.show as SinonStub;
    expect(showStub.getCall(0)).to.have.been.calledWithMatch(match.object, 'actor.hit.hit');
    expect(showStub.getCall(1)).to.have.been.calledWithMatch(match.object, 'actor.hit.health');
  });

  it('should note when the target dies', async () => {
    const item = makeTestItem('', '', '');
    const actor = makeTestActor('', '', '', item);
    actor.stats.set(STAT_HEALTH, 0);

    const stateHelper = getStubHelper();
    const context = createTestContext({
      actor,
      item,
      room: makeTestRoom('', '', '', [], []),
      state: stateHelper,
    });

    await SignalActorHit.call(actor, context);

    const showStub = stateHelper.show as SinonStub;
    expect(showStub.getCall(0)).to.have.been.calledWithMatch(match.object, 'actor.hit.hit');
    expect(showStub.getCall(1)).to.have.been.calledWithMatch(match.object, 'actor.hit.dead');
  });
});
