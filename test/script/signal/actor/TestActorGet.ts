import { expect } from 'chai';
import { createStubInstance, match } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { ActorSource } from '../../../../src/model/entity/Actor';
import { SignalActorGet } from '../../../../src/script/signal/actor/ActorGet';
import { MathRandomService } from '../../../../src/service/random/MathRandom';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity';
import { createTestContext, createTestTransfer, getStubHelper } from '../../../helper';

describe('actor get scripts', () => {
  describe('actor get signal', () => {
    it('should require the script target be an actor', async () => {
      const script = createStubInstance(LocalScriptService);
      const state = getStubHelper();

      const item = makeTestItem('', '', '');
      const actor = makeTestActor('', '', '', item);

      const context = createTestContext({
        actor,
        item,
        random: createStubInstance(MathRandomService),
        room: makeTestRoom('', '', '', [], []),
        script,
        state,
      });

      await expect(SignalActorGet.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
      await expect(SignalActorGet.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    });

    it('should show the received item', async () => {
      const script = createStubInstance(LocalScriptService);
      const state = getStubHelper();
      const transfer = createTestTransfer();

      const item = makeTestItem('', '', '');
      const actor = makeTestActor('', '', '');
      actor.source = ActorSource.PLAYER;

      const context = createTestContext({
        actor,
        item,
        random: createStubInstance(MathRandomService),
        room: makeTestRoom('', '', '', [], []),
        script,
        state,
        transfer,
      });
      await SignalActorGet.call(actor, context);

      expect(state.show).to.have.been.calledWithMatch(match.object, 'actor.get.player');
    });
  });
});
