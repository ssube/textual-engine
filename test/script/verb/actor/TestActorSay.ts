import { expect } from 'chai';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../src/model/Command';
import { VerbActorSay } from '../../../../src/script/verb/actor/ActorSay';
import { VERB_LOOK, VERB_SAY } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity';
import { createTestContext, getStubHelper } from '../../../helper';

describe('actor say verb', () => {
  it('should require the script target be an actor', async () => {
    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      room: makeTestRoom('', '', '', [], []),
    });

    await expect(VerbActorSay.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(VerbActorSay.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should show the first target as a message', async () => {
    const state = getStubHelper();
    const context = createTestContext({
      command: makeCommand(VERB_SAY, 'foo bar'),
      state,
    });

    await VerbActorSay.call(makeTestActor('', '', ''), context);

    expect(state.show).to.have.been.calledWith(context.source, 'actor.verb.say.line');
  });
});
