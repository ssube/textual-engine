import { expect } from 'chai';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../src/model/Command';
import { SignalItemStep } from '../../../../src/script/signal/item/ItemStep';
import { VERB_WAIT } from '../../../../src/util/constants';
import { makeTestActor, makeTestRoom } from '../../../entity';
import { createTestContext } from '../../../helper';

describe('item step signal', () => {
  it('should require the script target be an item', async () => {
    const context = createTestContext({
      command: makeCommand(VERB_WAIT),
      room: makeTestRoom('', '', '', [], []),
    });

    await expect(SignalItemStep.call(makeTestActor('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalItemStep.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });
});
