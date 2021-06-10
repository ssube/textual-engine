import { expect } from 'chai';
import { NullLogger } from 'noicejs';
import { createStubInstance, match, SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { VerbActorUse } from '../../../../src/script/verb/ActorUse';
import { MathRandomGenerator } from '../../../../src/service/random/MathRandom';
import { ScriptContext } from '../../../../src/service/script';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { SIGNAL_USE, VERB_USE } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity';
import { getStubHelper } from '../../../helper';
import { testTransfer } from '../../helper';

describe('actor use scripts', () => {
  describe('actor use command', () => {
    it('should require the script target be an actor', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const context: ScriptContext = {
        command: {
          index: 0,
          input: '',
          target: '',
          verb: VERB_USE,
        },
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
        transfer,
      };

      await expect(VerbActorUse.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
      await expect(VerbActorUse.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
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
          verb: VERB_USE,
        },
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
        transfer,
      };

      await VerbActorUse.call(makeTestActor('', '', ''), context);

      expect(stateHelper.show).to.have.callCount(1).and.been.calledWith('actor.step.use.type');
    });

    it('should invoke the use signal on the target', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const item = makeTestItem('', '', '');
      (stateHelper.find as SinonStub).returns(Promise.resolve([item]));

      const context: ScriptContext = {
        command: {
          index: 0,
          input: '',
          target: '',
          verb: VERB_USE,
        },
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
        transfer,
      };

      const actor = makeTestActor('', '', '');
      await VerbActorUse.call(actor, context);

      expect(script.invoke).to.have.been.calledWithMatch(item, SIGNAL_USE, match.has('actor', actor));
    });
  });
});
