import { expect } from 'chai';
import { createStubInstance, SinonStub } from 'sinon';

import { SignalActorLookLucy } from '../../../../../src/script/signal/actor/dracula/LookLucy';
import { ScriptTargetError } from '../../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../../src/model/Command';
import { MathRandomService } from '../../../../../src/service/random/MathRandom';
import { STAT_HEALTH, VERB_LOOK } from '../../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../../entity';
import { createTestContext, getStubHelper } from '../../../../helper';

describe('actor look signal for Lucy character', () => {
  it('should require the script target be an actor', async () => {
    const state = getStubHelper();

    const room = makeTestRoom('', '', '', [], []);
    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      random: createStubInstance(MathRandomService),
      room,
      source: {
        room,
      },
      state,
    });

    await expect(SignalActorLookLucy.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalActorLookLucy.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should describe her condition', async () => {
    const state = getStubHelper();
    const showStub = state.show as SinonStub;

    const room = makeTestRoom('', '', '', [], []);
    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      random: createStubInstance(MathRandomService),
      room,
      source: {
        room,
      },
      state,
    });

    const lucy = makeTestActor('', '', '');

    lucy.stats.set(STAT_HEALTH, 20);
    await SignalActorLookLucy.call(lucy, context);
    expect(showStub).to.have.been.calledWith(context.source, 'actor.step.look.actor.healthy');
    showStub.resetHistory();

    lucy.stats.set(STAT_HEALTH, 10);
    await SignalActorLookLucy.call(lucy, context);
    expect(showStub).to.have.been.calledWith(context.source, 'actor.step.look.actor.pale');
    showStub.resetHistory();

    lucy.stats.set(STAT_HEALTH, 5);
    await SignalActorLookLucy.call(lucy, context);
    expect(showStub).to.have.been.calledWith(context.source, 'actor.step.look.actor.pale');
    showStub.resetHistory();

    lucy.stats.set(STAT_HEALTH, 0);
    await SignalActorLookLucy.call(lucy, context);
    expect(showStub).to.have.been.calledWith(context.source, 'actor.step.look.actor.dead');
    showStub.resetHistory();
  });
});
