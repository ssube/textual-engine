import { expect } from 'chai';

import { ScriptTargetError } from '../../../../../src/error/ScriptTargetError.js';
import { makeCommand } from '../../../../../src/model/Command.js';
import { SignalBehaviorRRHHunter } from '../../../../../src/script/signal/behavior/red-riding-hood/BehaviorHunter';
import { VERB_LOOK } from '../../../../../src/util/constants.js';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../../entity.js';
import { createTestContext } from '../../../../helper.js';

describe('actor behavior signal for the hunter', () => {
  it('should require the script target be an actor', async () => {
    const room = makeTestRoom('', '', '', [], []);
    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      room,
      source: {
        room,
      },
    });

    await expect(SignalBehaviorRRHHunter.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalBehaviorRRHHunter.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should eat cake', async () => {
    const room = makeTestRoom('', '', '', [], []);
    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      room,
      source: {
        room,
      },
    });

    await SignalBehaviorRRHHunter.call(makeTestActor('', '', ''), context);

    // TODO: make assertions
  });

  xit('should move to grandma\'s house');
});
