import { expect } from 'chai';

import { ScriptTargetError } from '../../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../../src/model/Command';
import { SignalBehaviorRRHWolfRoof } from '../../../../../src/script/signal/behavior/red-riding-hood/BehaviorWolfRoof';
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

    await expect(SignalBehaviorRRHWolfRoof.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalBehaviorRRHWolfRoof.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  xit('should fall into the trough once the sausage water has been added');
});
