import { expect } from 'chai';
import { createStubInstance } from 'sinon';

import { ScriptTargetError } from '../../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../../src/model/Command';
import { SignalBehaviorAliceHedgehog } from '../../../../../src/script/signal/behavior/alice/BehaviorHedgehog';
import { MathRandomService } from '../../../../../src/service/random/MathRandom';
import { VERB_LOOK } from '../../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../../entity';
import { createTestContext, getStubHelper } from '../../../../helper';

describe('actor behavior signal for the hedgehogs', () => {
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

    await expect(SignalBehaviorAliceHedgehog.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalBehaviorAliceHedgehog.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should wander away', async () => {
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

    await SignalBehaviorAliceHedgehog.call(makeTestActor('', '', ''), context);
    // TODO: make assertions
  });
});
