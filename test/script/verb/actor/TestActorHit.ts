import { expect } from 'chai';
import { NullLogger } from 'noicejs';
import { createStubInstance, match, SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { Actor } from '../../../../src/model/entity/Actor';
import { VerbActorHit } from '../../../../src/script/verb/actor/ActorHit';
import { MathRandomGenerator } from '../../../../src/service/random/MathRandom';
import { ScriptContext } from '../../../../src/service/script';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { SIGNAL_HIT, VERB_HIT, VERB_WAIT } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity';
import { getStubHelper } from '../../../helper';
import { testTransfer } from '../../helper';

describe('actor hit scripts', () => {
  describe('actor hit command', () => {
    it('should require the script target be an actor', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const context: ScriptContext = {
        command: {
          index: 0,
          input: '',
          target: '',
          verb: VERB_WAIT,
        },
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
        transfer,
      };

      await expect(VerbActorHit.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
      await expect(VerbActorHit.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    });

    it('should find the target and invoke its hit signal', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const target: Actor = makeTestActor('', '', '');
      (stateHelper.find as SinonStub).returns(Promise.resolve([target]));

      const context: ScriptContext = {
        command: {
          index: 0,
          input: '',
          target: '',
          verb: VERB_HIT,
        },
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
        transfer,
      };

      const weapon = makeTestItem('foo', '', '');
      weapon.slot = 'weapon';
      const actor = makeTestActor('bar', '', '', weapon);
      actor.slots.set('weapon', 'foo');

      await VerbActorHit.call(actor, context);

      expect(script.invoke).to.have.callCount(1).and.to.have.been.calledWithMatch(target, SIGNAL_HIT, match.object);
    });

    it('should show an error if the target is not found', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      (stateHelper.find as SinonStub).returns(Promise.resolve([]));

      const context: ScriptContext = {
        command: {
          index: 0,
          input: '',
          target: '',
          verb: VERB_HIT,
        },
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
        transfer,
      };

      await VerbActorHit.call(makeTestActor('', '', '', makeTestItem('', '', '')), context);

      expect(script.invoke).to.have.callCount(0);
      expect(stateHelper.show).to.have.callCount(1);
    });

    it('should show an error if the actor is hitting itself', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const actor: Actor = makeTestActor('', '', '', makeTestItem('', '', ''));
      (stateHelper.find as SinonStub).returns(Promise.resolve([actor]));

      const context: ScriptContext = {
        command: {
          index: 0,
          input: '',
          target: '',
          verb: VERB_HIT,
        },
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
        transfer,
      };

      await VerbActorHit.call(actor, context);

      expect(script.invoke).to.have.callCount(0);
      expect(stateHelper.show).to.have.callCount(1).and.been.calledWith('actor.step.hit.self');
    });

    it('should show an error if the actor does not have any items', async () => {
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
          verb: VERB_HIT,
        },
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
        transfer,
      };

      await VerbActorHit.call(makeTestActor('', '', ''), context);

      expect(script.invoke).to.have.callCount(0);
      expect(stateHelper.show).to.have.callCount(1).and.been.calledWith('actor.step.hit.item');
    });
  });
});
