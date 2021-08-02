import { expect } from 'chai';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError.js';
import { makeCommand } from '../../../../src/model/Command.js';
import { SignalRoomStep } from '../../../../src/script/signal/room/RoomStep.js';
import { VERB_WAIT } from '../../../../src/util/constants.js';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity.js';
import { createTestContext, getStubHelper } from '../../../helper.js';

describe('room step signal', () => {
  it('should require the script target be an item', async () => {
    const context = createTestContext({
      command: makeCommand(VERB_WAIT),
      room: makeTestRoom('', '', '', [], []),
    });

    await expect(SignalRoomStep.call(makeTestActor('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalRoomStep.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  // this can't really be tested
  it('should be a noop', async () => {
    const state = getStubHelper();

    const context = createTestContext({
      command: makeCommand(VERB_WAIT),
      state,
    });

    await expect(SignalRoomStep.call(makeTestRoom('', '', '', [], []), context)).to.eventually.equal(undefined);
  });
});
