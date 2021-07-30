import { expect } from 'chai';
import type { SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError.js';
import { makeCommand } from '../../../../src/model/Command.js';
import { VerbActorReplace } from '../../../../src/script/verb/actor/ActorReplace.js';
import { SIGNAL_REPLACE, VERB_WAIT } from '../../../../src/util/constants.js';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity.js';
import { createTestContext, getStubHelper } from '../../../helper.js';

describe('actor replace verb', () => {
  it('should require the script target be an actor', async () => {
    const context = createTestContext({
      command: makeCommand(VERB_WAIT),
      room: makeTestRoom('', '', '', [], []),
    });

    await expect(VerbActorReplace.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(VerbActorReplace.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should show an error if the target is not an item', async () => {
    const state = getStubHelper();
    (state.find as SinonStub).resolves([]);

    const context = createTestContext({
      command: makeCommand(VERB_WAIT, 'foo'),
      room: makeTestRoom('', '', '', [], []),
      state,
    });

    await VerbActorReplace.call(makeTestActor('', '', ''), context);

    expect(state.show).to.have.callCount(1).and.been.calledWith(context.source, 'actor.verb.replace.missing');
  });

  it('should signal the target', async () => {
    const state = getStubHelper();

    const target = makeTestItem('', '', '');
    (state.find as SinonStub).resolves([target]);

    const context = createTestContext({
      command: makeCommand(VERB_WAIT, 'foo'),
      room: makeTestRoom('', '', '', [], []),
      state,
    });

    await VerbActorReplace.call(makeTestActor('', '', ''), context);

    expect(context.script.invoke).to.have.callCount(1).and.been.calledWith(target, SIGNAL_REPLACE);
  });
});
