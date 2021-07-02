import { expect } from 'chai';

import { ScriptTargetError } from '../../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../../src/model/Command';
import { SignalBehaviorRRHHunter } from '../../../../../src/script/signal/behavior/red-riding-hood/BehaviorHunter';
import { VERB_LOOK } from '../../../../../src/util/constants';
import { makeTestItem, makeTestRoom } from '../../../../entity';
import { createTestContext } from '../../../../helper';

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

  xit('should eat cake');
  xit('should move to grandma\'s house');
});
