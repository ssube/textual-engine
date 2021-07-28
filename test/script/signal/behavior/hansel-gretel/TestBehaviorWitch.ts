import { expect } from 'chai';

import { ScriptTargetError } from '../../../../../src/error/ScriptTargetError.js';
import { makeCommand } from '../../../../../src/model/Command.js';
import { SignalBehaviorHGWitch } from '../../../../../src/script/signal/behavior/hansel-gretel/BehaviorWitch';
import { VERB_LOOK } from '../../../../../src/util/constants.js';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../../entity.js';
import { createTestContext, getStubHelper } from '../../../../helper.js';

describe('actor behavior signal for the witch', () => {
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

    await expect(SignalBehaviorHGWitch.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalBehaviorHGWitch.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should push the non-player sibling into the cage', async () => {
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

    await SignalBehaviorHGWitch.call(makeTestActor('', '', ''), context);

    // TODO: make assertions
  });

  xit('should die in the oven');
});
