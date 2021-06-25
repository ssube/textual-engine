import { expect } from 'chai';
import { createStubInstance, match, SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../src/model/Command';
import { SignalPortalLook } from '../../../../src/script/signal/portal/PortalLook';
import { MathRandomService } from '../../../../src/service/random/MathRandom';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { VERB_LOOK } from '../../../../src/util/constants';
import { makeTestActor, makeTestPortal, makeTestRoom } from '../../../entity';
import { createTestContext, createTestTransfer, getStubHelper } from '../../../helper';

describe('portal look scripts', () => {
  it('should require the script target be a portal', async () => {
    const script = createStubInstance(LocalScriptService);
    const state = getStubHelper();
    const transfer = createTestTransfer();

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      random: createStubInstance(MathRandomService),
      room: makeTestRoom('', '', '', [], []),
      script,
      state,
      transfer,
    });

    await expect(SignalPortalLook.call(makeTestActor('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalPortalLook.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should describe the portal', async () => {
    const script = createStubInstance(LocalScriptService);
    const state = getStubHelper();

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      random: createStubInstance(MathRandomService),
      room: makeTestRoom('', '', '', [], []),
      script,
      state,
    });

    await SignalPortalLook.call(makeTestPortal('', '', '', '', ''), context);

    expect(state.show).to.have.been.calledWithMatch(match.object, 'actor.step.look.room.portal');
  });

  it('should describe the portal destination room', async () => {
    const script = createStubInstance(LocalScriptService);
    const state = getStubHelper();

    const portal = makeTestPortal('', '', '', '', 'foo');
    const room = makeTestRoom('foo', '', '', [], [], [portal]);
    (state.find as SinonStub).resolves([room]);

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      random: createStubInstance(MathRandomService),
      room,
      script,
      state,
    });

    await SignalPortalLook.call(portal, context);

    expect(state.show).to.have.been.calledWithMatch(match.object, 'actor.step.look.room.portal');
  });
});
