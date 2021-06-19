import { expect } from 'chai';
import { NullLogger } from 'noicejs';
import { createStubInstance } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../src/model/Command';
import { SignalItemStep } from '../../../../src/script/signal/item/ItemStep';
import { MathRandomGenerator } from '../../../../src/service/random/MathRandom';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { VERB_WAIT } from '../../../../src/util/constants';
import { makeTestActor, makeTestRoom } from '../../../entity';
import { getStubHelper } from '../../../helper';
import { testTransfer } from '../../helper';

describe('item step scripts', () => {
  describe('item step command', () => {
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

      await expect(SignalItemStep.call(makeTestActor('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
      await expect(SignalItemStep.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    });
  });
});
