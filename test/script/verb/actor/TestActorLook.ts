import { expect } from 'chai';
import { NullLogger } from 'noicejs';
import { createStubInstance, match } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../src/model/Command';
import { VerbActorLook } from '../../../../src/script/verb/actor/ActorLook';
import { MathRandomGenerator } from '../../../../src/service/random/MathRandom';
import { ScriptContext } from '../../../../src/service/script';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { SIGNAL_LOOK, VERB_LOOK } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity';
import { getStubHelper } from '../../../helper';
import { testTransfer } from '../../helper';

describe('actor look scripts', () => {
  describe('actor look command without a target', () => {
    it('should require the script target be an actor', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const context: ScriptContext = {
        command: {
          index: 0,
          input: '',
          target: '',
          verb: VERB_LOOK,
        },
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
        transfer,
      };

      await expect(VerbActorLook.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
      await expect(VerbActorLook.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    });

    it('should describe the room', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const room = makeTestRoom('', '', '', [], []);
      const context: ScriptContext = {
        command: makeCommand(VERB_LOOK, ''),
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room,
        script,
        state: stateHelper,
        transfer,
      };

      await VerbActorLook.call(makeTestActor('', '', ''), context);

      expect(script.invoke).to.have.been.calledWithMatch(room, SIGNAL_LOOK, match.object);
    });

    it('should not include the player when looking at a target', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const actor = makeTestActor('', '', '');
      const context: ScriptContext = {
        command: makeCommand(VERB_LOOK, ''),
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [actor], []),
        script,
        state: stateHelper,
        transfer,
      };

      await VerbActorLook.call(actor, context);

      expect(stateHelper.show).to.have.callCount(2);
      expect(stateHelper.show).to.have.been.calledWith('actor.step.look.room.you');
      expect(stateHelper.show).to.have.been.calledWith('actor.step.look.room.health');
    });
  });

  describe('actor look command with target', () => {
    xit('should describe the target actor');
    xit('should describe the target item');
    xit('should note when actors are dead');
  });
});
