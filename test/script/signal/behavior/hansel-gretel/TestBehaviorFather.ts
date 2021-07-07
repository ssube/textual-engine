import { expect } from 'chai';

import { ScriptTargetError } from '../../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../../src/model/Command';
import { SignalBehaviorHGFather } from '../../../../../src/script/signal/behavior/hansel-gretel/BehaviorFather';
import { VERB_LOOK } from '../../../../../src/util/constants';
import { makeTestItem, makeTestRoom } from '../../../../entity';
import { createTestContext, getStubHelper } from '../../../../helper';

describe('actor behavior signal for the father', () => {
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

    await expect(SignalBehaviorHGFather.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalBehaviorHGFather.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  xit('should lead the children into the woods');
  xit('should return to the house');
});
