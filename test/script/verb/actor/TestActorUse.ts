import { expect } from 'chai';
import { createStubInstance, match, SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../src/model/Command';
import { VerbActorUse } from '../../../../src/script/verb/actor/ActorUse';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { SIGNAL_USE, VERB_USE } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity';
import { createTestContext, getStubHelper } from '../../../helper';

describe('actor use verb', () => {
  it('should require the script target be an actor', async () => {
    const context = createTestContext({
      command: makeCommand(VERB_USE),
    });

    await expect(VerbActorUse.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(VerbActorUse.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should show an error if the target is not an item', async () => {
    const stateHelper = getStubHelper();
    (stateHelper.find as SinonStub).resolves([
      makeTestActor('', '', ''),
    ]);

    const context = createTestContext({
      command: makeCommand(VERB_USE, 'foo'),
      room: makeTestRoom('', '', '', [], []),
      state: stateHelper,
    });

    await VerbActorUse.call(makeTestActor('', '', ''), context);

    expect(stateHelper.show).to.have.callCount(1).and.been.calledWithMatch(match.object, 'actor.step.use.type');
  });

  it('should invoke the use signal on the item', async () => {
    const script = createStubInstance(LocalScriptService);
    const state = getStubHelper();

    const item = makeTestItem('foo', '', '');
    (state.find as SinonStub).resolves([item]);

    const context = createTestContext({
      command: makeCommand(VERB_USE, 'foo'),
      room: makeTestRoom('', '', '', [], []),
      script,
      state,
    });

    const actor = makeTestActor('', '', '');
    await VerbActorUse.call(actor, context);

    expect(script.invoke).to.have.been.calledWithMatch(actor, SIGNAL_USE, match.has('item', item));
  });

  it('should target other actors', async () => {
    const script = createStubInstance(LocalScriptService);
    const state = getStubHelper();

    const item = makeTestItem('foo', '', '');
    (state.find as SinonStub).onFirstCall().resolves([item]);

    const target = makeTestActor('bar', '', '');
    (state.find as SinonStub).onSecondCall().resolves([target]);

    const context = createTestContext({
      command: makeCommand(VERB_USE, 'foo', 'bar'),
      room: makeTestRoom('', '', '', [], []),
      script,
      state,
    });

    const actor = makeTestActor('', '', '');
    await VerbActorUse.call(actor, context);

    expect(script.invoke).to.have.been.calledWithMatch(target, SIGNAL_USE, match.has('item', item));
  });

  it('should show an error when the target cannot be found', async () => {
    const state = getStubHelper();

    const item = makeTestItem('foo', '', '');
    (state.find as SinonStub).onFirstCall().resolves([item]);

    (state.find as SinonStub).onSecondCall().resolves([]);

    const context = createTestContext({
      command: makeCommand(VERB_USE, 'foo', 'bar'),
      room: makeTestRoom('', '', '', [], []),
      state,
    });

    const actor = makeTestActor('', '', '');
    await VerbActorUse.call(actor, context);

    expect(state.show).to.have.callCount(1).and.been.calledWithMatch(match.object, 'actor.step.use.target');
  });
});
