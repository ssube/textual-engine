import { expect } from 'chai';
import { NullLogger } from 'noicejs';
import { createStubInstance } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../src/model/Command';
import { SignalRoomStep } from '../../../../src/script/signal/room/RoomStep';
import { MathRandomGenerator } from '../../../../src/service/random/MathRandom';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { VERB_WAIT } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity';
import { getStubHelper } from '../../../helper';
import { testTransfer } from '../../helper';

describe('room step scripts', () => {
  describe('room step command', () => {
    it('should require the script target be an item', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const context = {
        command: makeCommand(VERB_WAIT, ''),
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
        transfer,
      };

      await expect(SignalRoomStep.call(makeTestActor('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
      await expect(SignalRoomStep.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    });

    // this can't really be tested
    it('should be a noop', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const context = {
        command: makeCommand(VERB_WAIT, ''),
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
        transfer,
      };

      await expect(SignalRoomStep.call(makeTestRoom('', '', '', [], []), context)).to.eventually.equal(undefined);
    });
  });
});
