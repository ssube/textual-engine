import { expect } from 'chai';
import { NullLogger } from 'noicejs';
import { createStubInstance, SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { SignalActorHit } from '../../../../src/script/signal/actor/ActorHit';
import { MathRandomGenerator } from '../../../../src/service/random/MathRandom';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { STAT_DAMAGE, STAT_HEALTH } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity';
import { getStubHelper } from '../../../helper';
import { testTransfer } from '../../helper';

describe('actor hit scripts', () => {
  describe('actor hit signal', () => {
    it('should remove some health', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const item = makeTestItem('', '', '');
      item.stats.set(STAT_DAMAGE, 5);

      const actor = makeTestActor('', '', '');
      actor.stats.set(STAT_DAMAGE, 5);
      actor.stats.set(STAT_HEALTH, 10);

      const random = createStubInstance(MathRandomGenerator);
      random.nextInt.returnsArg(0); // do max damage, 5 + 5

      await SignalActorHit.call(actor, {
        actor,
        data: new Map(),
        item,
        logger: NullLogger.global,
        random,
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
        transfer,
      });

      expect(actor.stats.get(STAT_HEALTH)).to.equal(0);
    });

    it('should require the script target be an actor', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const item = makeTestItem('', '', '');
      const actor = makeTestActor('', '', '', item);

      const context = {
        actor,
        data: new Map(),
        item,
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
        transfer,
      };

      await expect(SignalActorHit.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
      await expect(SignalActorHit.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    });

    it('should note when the target dies', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const item = makeTestItem('', '', '');
      const actor = makeTestActor('', '', '', item);
      actor.stats.set(STAT_HEALTH, 0);

      await SignalActorHit.call(actor, {
        actor,
        data: new Map(),
        item,
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
        transfer,
      });

      const showStub = stateHelper.show as SinonStub;
      expect(showStub.getCall(0)).to.have.been.calledWith('actor.hit.hit');
      expect(showStub.getCall(1)).to.have.been.calledWith('actor.hit.dead');
    });
  });
});
