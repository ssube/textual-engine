import { expect } from 'chai';

import { ScriptTargetError } from '../../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../../src/model/Command';
import { SignalBehaviorRRHWolfForest } from '../../../../../src/script/signal/behavior/red-riding-hood/BehaviorWolfForest';
import { VERB_LOOK } from '../../../../../src/util/constants';
import { makeTestItem, makeTestRoom } from '../../../../entity';
import { createTestContext } from '../../../../helper';

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

  xit('should eat grandma');
  xit('should empty the wolf room when it dies');
});
