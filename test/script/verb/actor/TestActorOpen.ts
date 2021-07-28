import { expect } from 'chai';
import { SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError.js';
import { makeCommand } from '../../../../src/model/Command.js';
import { VerbActorOpen } from '../../../../src/script/verb/actor/ActorOpen.js';
import { STAT_CLOSED, VERB_LOOK } from '../../../../src/util/constants.js';
import { makeTestActor, makeTestItem, makeTestPortal, makeTestRoom } from '../../../entity.js';
import { createTestContext, getStubHelper } from '../../../helper.js';

describe('actor open verb', () => {
  it('should require the script target be an actor', async () => {
    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      room: makeTestRoom('', '', '', [], []),
    });

    await expect(VerbActorOpen.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(VerbActorOpen.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should show a message when the target is not found', async () => {
    const state = getStubHelper();
    (state.find as SinonStub).resolves([]);

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      state,
    });

    await VerbActorOpen.call(makeTestActor('', '', ''), context);

    expect(state.show).to.have.been.calledWith(context.source, 'actor.verb.open.missing');
  });

  it('should show a message when the portal is already open', async () => {
    const portal = makeTestPortal('', '', '', '', '');
    const state = getStubHelper();
    (state.find as SinonStub).resolves([portal]);

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      state,
    });

    await VerbActorOpen.call(makeTestActor('', '', ''), context);

    expect(state.show).to.have.been.calledWith(context.source, 'actor.verb.open.already');
  });

  it('should open the portal', async () => {
    const portal = makeTestPortal('', '', '', '', '');
    portal.stats.set(STAT_CLOSED, 1);

    const state = getStubHelper();
    (state.find as SinonStub).resolves([portal]);

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      state,
    });

    await VerbActorOpen.call(makeTestActor('', '', ''), context);

    expect(portal.stats.get(STAT_CLOSED)).to.equal(0);
    expect(state.show).to.have.been.calledWith(context.source, 'actor.verb.open.portal');
  });
});
