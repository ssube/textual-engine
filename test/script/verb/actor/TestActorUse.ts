import { expect } from 'chai';
import { createStubInstance, match, SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../src/model/Command';
import { VerbActorUse } from '../../../../src/script/verb/actor/ActorUse';
import { MathRandomService } from '../../../../src/service/random/MathRandom';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { SIGNAL_USE, VERB_USE } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity';
import { createTestContext, getStubHelper } from '../../../helper';

describe('actor use scripts', () => {
  describe('actor use command', () => {
    it('should require the script target be an actor', async () => {
      const context = createTestContext({
        command: makeCommand(VERB_USE),
      });

      await expect(VerbActorUse.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
      await expect(VerbActorUse.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    });

    it('should show an error if the target is not an item', async () => {
      const stateHelper = getStubHelper();
      (stateHelper.find as SinonStub).returns(Promise.resolve([
        makeTestActor('', '', ''),
      ]));

      const context = createTestContext({
        command: makeCommand(VERB_USE, 'foo'),
        random: createStubInstance(MathRandomService),
        room: makeTestRoom('', '', '', [], []),
        state: stateHelper,
      });

      await VerbActorUse.call(makeTestActor('', '', ''), context);

      expect(stateHelper.show).to.have.callCount(1).and.been.calledWithMatch(match.object, 'actor.step.use.type');
    });

    it('should invoke the use signal on the target', async () => {
      const script = createStubInstance(LocalScriptService);
      const state = getStubHelper();

      const item = makeTestItem('foo', '', '');
      (state.find as SinonStub).returns(Promise.resolve([item]));

      const context = createTestContext({
        command: makeCommand(VERB_USE, 'foo'),
        random: createStubInstance(MathRandomService),
        room: makeTestRoom('', '', '', [], []),
        script,
        state,
      });

      const actor = makeTestActor('', '', '');
      await VerbActorUse.call(actor, context);

      expect(script.invoke).to.have.been.calledWithMatch(item, SIGNAL_USE, match.has('actor', actor));
    });
  });
});
