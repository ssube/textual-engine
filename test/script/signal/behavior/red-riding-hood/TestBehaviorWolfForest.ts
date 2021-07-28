import { expect } from 'chai';

import { ScriptTargetError } from '../../../../../src/error/ScriptTargetError.js';
import { makeCommand } from '../../../../../src/model/Command.js';
import { SignalBehaviorRRHWolfForest } from '../../../../../src/script/signal/behavior/red-riding-hood/BehaviorWolfForest';
import { VERB_LOOK } from '../../../../../src/util/constants.js';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../../entity.js';
import { createTestContext } from '../../../../helper.js';

describe('actor behavior signal for the forest wolf', () => {
  it('should require the script target be an actor', async () => {
    const room = makeTestRoom('', '', '', [], []);
    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      room,
      source: {
        room,
      },
    });

    await expect(SignalBehaviorRRHWolfForest.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalBehaviorRRHWolfForest.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should eat grandma', async () => {
    const room = makeTestRoom('', '', '', [], []);
    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      room,
      source: {
        room,
      },
    });

    await SignalBehaviorRRHWolfForest.call(makeTestActor('', '', ''), context);

    // TODO: make assertions
  });

  xit('should empty the wolf room when it dies');
});
