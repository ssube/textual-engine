import { expect } from 'chai';

import { ScriptTargetError } from '../../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../../src/model/Command';
import { SignalBehaviorDraculaVanHelsing } from '../../../../../src/script/signal/behavior/dracula/BehaviorVanHelsing';
import { VERB_LOOK } from '../../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../../entity';
import { createTestContext, getStubHelper } from '../../../../helper';

describe('actor behavior signal for Van Helsing', () => {
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

    await expect(SignalBehaviorDraculaVanHelsing.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalBehaviorDraculaVanHelsing.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should move into the gate after some turns', async () => {
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

    await SignalBehaviorDraculaVanHelsing.call(makeTestActor('', '', ''), context);

    // TODO: make assertions
  });

  xit('should move to the back of the house after some turns');
  xit('should give the saw to the player');
  xit('should move to Lucy');
  xit('should teleport into the living room with Lucy');
  xit('should give the note to the player');
});
