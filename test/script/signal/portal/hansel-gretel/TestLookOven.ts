import { expect } from 'chai';
import { match, SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../../src/model/Command';
import { SignalPortalLookHGOven } from '../../../../../src/script/signal/portal/hansel-gretel/LookOven';
import { VERB_LOOK } from '../../../../../src/util/constants';
import { makeTestActor, makeTestPortal, makeTestRoom } from '../../../../entity';
import { createTestContext, getStubHelper } from '../../../../helper';

describe('portal look scripts for oven door', () => {
  it('should require the script target be a portal', async () => {
    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      room: makeTestRoom('', '', '', [], []),
    });

    await expect(SignalPortalLookHGOven.call(makeTestActor('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalPortalLookHGOven.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should describe the portal', async () => {
    const state = getStubHelper();
    (state.find as SinonStub).resolves([]);

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      room: makeTestRoom('', '', '', [], []),
      state,
    });

    await SignalPortalLookHGOven.call(makeTestPortal('', '', '', '', ''), context);

    expect(state.show).to.have.been.calledWithMatch(match.object, 'actor.step.look.room.portal');
  });

  it('should describe actors in the portal destination room', async () => {
    const state = getStubHelper();

    const portal = makeTestPortal('', '', '', '', 'foo');
    const room = makeTestRoom('foo', '', '', [], [], [portal]);

    const findStub = state.find as SinonStub;
    findStub.onFirstCall().resolves([room]);

    const actor = makeTestActor('', '', '');
    findStub.onSecondCall().resolves([actor]);

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      room,
      state,
    });

    await SignalPortalLookHGOven.call(portal, context);

    expect(state.show).to.have.been.calledWithMatch(match.object, 'portal.look.actor');
  });
});
