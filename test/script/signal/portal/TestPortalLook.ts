import { expect } from 'chai';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError.js';
import { makeCommand } from '../../../../src/model/Command.js';
import { SignalPortalLook } from '../../../../src/script/signal/portal/PortalLook.js';
import { STAT_CLOSED, VERB_LOOK } from '../../../../src/util/constants.js';
import { makeTestActor, makeTestPortal, makeTestRoom } from '../../../entity.js';
import { createTestContext, getStubHelper, match, SinonStub } from '../../../helper.js';

describe('portal look scripts', () => {
  it('should require the script target be a portal', async () => {
    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      room: makeTestRoom('', '', '', [], []),
    });

    await expect(SignalPortalLook.call(makeTestActor('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalPortalLook.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should describe the portal', async () => {
    const state = getStubHelper();

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      room: makeTestRoom('', '', '', [], []),
      state,
    });

    await SignalPortalLook.call(makeTestPortal('', '', '', '', ''), context);

    expect(state.show).to.have.been.calledWithMatch(match.object, 'portal.signal.look.seen');
  });

  it('should describe the portal destination room for open portals', async () => {
    const state = getStubHelper();

    const portal = makeTestPortal('', '', '', '', 'foo');
    const room = makeTestRoom('foo', '', '', [], [], [portal]);
    (state.find as SinonStub).resolves([room]);

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      room,
      state,
    });

    await SignalPortalLook.call(portal, context);

    expect(state.show).to.have.been.calledWithMatch(match.object, 'portal.signal.look.dest.room');
  });

  it('should show a message for closed portals', async () => {
    const state = getStubHelper();

    const portal = makeTestPortal('', '', '', '', 'foo');
    portal.stats.set(STAT_CLOSED, 1);

    const room = makeTestRoom('foo', '', '', [], [], [portal]);
    (state.find as SinonStub).resolves([room]);

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      room,
      state,
    });

    await SignalPortalLook.call(portal, context);

    expect(state.show).to.have.been.calledWithMatch(match.object, 'portal.signal.look.closed');
  });
});
