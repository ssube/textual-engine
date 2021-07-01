import { expect } from 'chai';
import { createStubInstance } from 'sinon';

import { ScriptTargetError } from '../../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../../src/model/Command';
import { SignalActorStepHGStepmother } from '../../../../../src/script/signal/actor/hansel-gretel/StepStepmother';
import { MathRandomService } from '../../../../../src/service/random/MathRandom';
import { STAT_HEALTH, VERB_LOOK } from '../../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../../entity';
import { createTestContext, getStubHelper } from '../../../../helper';

describe('actor step signal for stepmother character', () => {
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

    await expect(SignalActorStepHGStepmother.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalActorStepHGStepmother.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should die after some turns', async () => {
    const room = makeTestRoom('', '', '', [], []);
    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      room,
      source: {
        room,
      },
    });

    const stepmother = makeTestActor('', '', '');
    stepmother.stats.set('death-turn', 5);

    stepmother.stats.set(STAT_HEALTH, 20);
    await SignalActorStepHGStepmother.call(stepmother, context);

    expect(stepmother.stats.get(STAT_HEALTH)).to.equal(20);

    await SignalActorStepHGStepmother.call(stepmother, {
      ...context,
      step: {
        time: 10,
        turn: 10,
      },
    });

    expect(stepmother.stats.get(STAT_HEALTH)).to.equal(0);
  });
});
