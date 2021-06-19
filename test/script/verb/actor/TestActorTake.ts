import { expect } from 'chai';
import { NullLogger } from 'noicejs';
import { createStubInstance, SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { VerbActorTake } from '../../../../src/script/verb/actor/ActorTake';
import { MathRandomGenerator } from '../../../../src/service/random/MathRandom';
import { ScriptContext } from '../../../../src/service/script';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { VERB_TAKE } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity';
import { getStubHelper } from '../../../helper';
import { testTransfer } from '../../helper';

describe('actor take scripts', () => {
  describe('actor take command', () => {
    it('should require the script target be an actor', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const context: ScriptContext = {
        command: {
          index: 0,
          input: '',
          target: '',
          verb: VERB_TAKE,
        },
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
        transfer,
      };

      await expect(VerbActorTake.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
      await expect(VerbActorTake.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    });

    it('should show an error if the target is not an item', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      (stateHelper.find as SinonStub).returns(Promise.resolve([
        makeTestActor('', '', ''),
      ]));

      const context: ScriptContext = {
        command: {
          index: 0,
          input: '',
          target: '',
          verb: VERB_TAKE,
        },
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
        transfer,
      };

      await VerbActorTake.call(makeTestActor('', '', ''), context);

      expect(stateHelper.show).to.have.callCount(1).and.been.calledWith('actor.step.take.type');
    });

    it('should transfer items from the target room', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const item = makeTestItem('', '', '');
      (stateHelper.find as SinonStub).returns(Promise.resolve([item]));

      const room = makeTestRoom('', '', '', [], [item]);
      const context: ScriptContext = {
        command: {
          index: 0,
          input: '',
          target: '',
          verb: VERB_TAKE,
        },
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room,
        script,
        state: stateHelper,
        transfer,
      };

      const actor = makeTestActor('', '', '');
      await VerbActorTake.call(actor, context);

      expect(transfer.moveItem).to.have.been.calledWith({
        moving: item,
        source: room,
        target: actor,
      });
    });
  });
});
