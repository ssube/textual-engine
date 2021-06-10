import { expect } from 'chai';
import { NullLogger } from 'noicejs';
import { createStubInstance, SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { PortalLinkage } from '../../../../src/model/entity/Portal';
import { VerbActorLook } from '../../../../src/script/verb/ActorLook';
import { MathRandomGenerator } from '../../../../src/service/random/MathRandom';
import { ScriptContext } from '../../../../src/service/script';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { VERB_LOOK } from '../../../../src/util/constants';
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

      await VerbActorLook.call(makeTestActor('', '', ''), context);

      expect(stateHelper.show).to.have.been.calledWith('actor.step.look.room.seen');
    });

    it('should describe actors in the room', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const actor = makeTestActor('', '', '');
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
        room: makeTestRoom('', '', '', [actor], []),
        script,
        state: stateHelper,
        transfer,
      };

      await VerbActorLook.call(makeTestActor('', '', ''), context);

      expect(stateHelper.show).to.have.been.calledWith('actor.step.look.room.you');
      expect(stateHelper.show).to.have.been.calledWith('actor.step.look.room.seen');
      expect(stateHelper.show).to.have.been.calledWith('actor.step.look.actor.seen');
    });

    it('should not include the script target when describing actors', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const actor = makeTestActor('', '', '');
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
        room: makeTestRoom('', '', '', [actor], []),
        script,
        state: stateHelper,
        transfer,
      };

      await VerbActorLook.call(actor, context);

      expect(stateHelper.show).to.have.callCount(2);
      expect(stateHelper.show).to.have.been.calledWith('actor.step.look.room.you');
      expect(stateHelper.show).to.have.been.calledWith('actor.step.look.room.seen');
    });

    it('should describe items in the room', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const item = makeTestItem('', '', '');
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
        room: makeTestRoom('', '', '', [], [item]),
        script,
        state: stateHelper,
        transfer,
      };

      await VerbActorLook.call(makeTestActor('', '', ''), context);

      const showStub = stateHelper.show as SinonStub;
      expect(showStub.getCall(0)).to.have.been.calledWith('actor.step.look.room.you');
      expect(showStub.getCall(1)).to.have.been.calledWith('actor.step.look.room.seen');
      expect(showStub.getCall(2)).to.have.been.calledWith('actor.step.look.item.seen');
    });

    it('should describe portals in the room', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const room = makeTestRoom('', '', '', [], []);
      room.portals.push({
        dest: 'foo',
        link: PortalLinkage.BOTH,
        name: 'door',
        sourceGroup: 'west',
        targetGroup: 'east',
      });

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
        room,
        script,
        state: stateHelper,
        transfer,
      };

      await VerbActorLook.call(makeTestActor('', '', ''), context);

      const showStub = stateHelper.show as SinonStub;
      expect(showStub.getCall(0)).to.have.been.calledWith('actor.step.look.room.you');
      expect(showStub.getCall(1)).to.have.been.calledWith('actor.step.look.room.seen');
      expect(showStub.getCall(2)).to.have.been.calledWith('actor.step.look.room.portal');
    });
  });

  describe('actor look command with target', () => {
    it('should describe the target actor');
    it('should describe the target item');
    it('should note when actors are dead');
  });
});
