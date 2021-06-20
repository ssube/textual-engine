import { expect } from 'chai';
import { NullLogger } from 'noicejs';
import { createStubInstance, SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../src/model/Command';
import { VerbActorEquip } from '../../../../src/script/verb/actor/ActorEquip';
import { MathRandomGenerator } from '../../../../src/service/random/MathRandom';
import { ScriptContext } from '../../../../src/service/script';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { VERB_EQUIP, VERB_WAIT } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom, makeTestState } from '../../../entity';
import { getStubHelper } from '../../../helper';
import { testTransfer } from '../../helper';

describe('actor equip scripts', () => {
  describe('actor equip command', () => {
    it('should require the target be an actor', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const context: ScriptContext = {
        command: makeCommand(VERB_WAIT, ''),
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
        transfer,
      };

      await expect(VerbActorEquip.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
      await expect(VerbActorEquip.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    });

    it('should equip items into the item slot when no target is given', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const slot = 'hand';
      const item = makeTestItem('foo', '', '');
      item.slot = slot;
      const actor = makeTestActor('', '', '', item);
      actor.slots.set(slot, '');

      (stateHelper.find as SinonStub).returns(Promise.resolve([
        item,
      ]));

      const context: ScriptContext = {
        command: makeCommand(VERB_EQUIP, item.meta.id),
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [actor], []),
        script,
        state: stateHelper,
        transfer,
      };
      await VerbActorEquip.call(actor, context);

      expect(actor.slots.get(slot)).to.equal(item.meta.id);
      expect(stateHelper.show).to.have.been.calledWith('actor.step.equip.item');
    });

    it('should show a message when the slot does not exist', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const context: ScriptContext = {
        command: makeCommand(VERB_EQUIP, 'foo'),
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
        transfer,
      };

      const slot = 'hand';
      const item = makeTestItem('foo', '', '');
      item.slot = slot;
      const actor = makeTestActor('', '', '', item);

      (stateHelper.find as SinonStub).returns(Promise.resolve([
        item,
      ]));

      await VerbActorEquip.call(actor, context);

      expect(stateHelper.show).to.have.been.calledWith('actor.step.equip.slot');
    });

    it('should show a message when the item does not exist', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const context: ScriptContext = {
        command: makeCommand(VERB_EQUIP, 'foo'),
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
        transfer,
      };

      const slot = 'hand';
      const actor = makeTestActor('', '', '');
      actor.slots.set(slot, '');

      (stateHelper.find as SinonStub).returns(Promise.resolve([]));

      await VerbActorEquip.call(actor, context);

      expect(stateHelper.show).to.have.been.calledWith('actor.step.equip.none');
    });

    xit('should equip items into the target slot');
  });
});
