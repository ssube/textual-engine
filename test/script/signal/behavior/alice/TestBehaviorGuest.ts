import { expect } from 'chai';
import { createStubInstance } from 'sinon';

import { ScriptTargetError } from '../../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../../src/model/Command';
import { SignalBehaviorAliceGuest } from '../../../../../src/script/signal/behavior/alice/BehaviorGuest';
import { MathRandomService } from '../../../../../src/service/random/MathRandom';
import { VERB_LOOK } from '../../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../../entity';
import { createTestContext, getStubHelper } from '../../../../helper';

describe('actor behavior signal for the croquet party guests', () => {
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

    await expect(SignalBehaviorAliceGuest.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalBehaviorAliceGuest.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should follow the red queen', async () => {
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

    await SignalBehaviorAliceGuest.call(makeTestActor('', '', ''), context);
    // TODO: make assertions
  });

  xit('should play croquet');
  xit('should move to the Cheshire Cat');
});
