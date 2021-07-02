import { expect } from 'chai';
import { createStubInstance } from 'sinon';

import { ScriptTargetError } from '../../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../../src/model/Command';
import { SignalBehaviorAliceCat } from '../../../../../src/script/signal/behavior/alice/BehaviorCat';
import { MathRandomService } from '../../../../../src/service/random/MathRandom';
import { VERB_LOOK } from '../../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../../entity';
import { createTestContext, getStubHelper } from '../../../../helper';

describe('actor behavior signal for the Cheshire Cat', () => {
  it('should require the script target be an actor', async () => {
    const room = makeTestRoom('', '', '', [], []);
    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      random: createStubInstance(MathRandomService),
      room,
      source: {
        room,
      },
    });

    await expect(SignalBehaviorAliceCat.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalBehaviorAliceCat.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should appear after some turns', async () => {
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

    await SignalBehaviorAliceCat.call(makeTestActor('', '', ''), context);
    // TODO: make assertions
  });

  xit('should vanish after some turns');
});
