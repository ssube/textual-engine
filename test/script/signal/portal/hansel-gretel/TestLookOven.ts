import { expect } from 'chai';
import { createStubInstance, match, SinonStub } from 'sinon';

import { SignalPortalLookHGOven } from '../../../../../src/script/signal/portal/hansel-gretel/LookOven';
import { ScriptTargetError } from '../../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../../src/model/Command';
import { MathRandomService } from '../../../../../src/service/random/MathRandom';
import { LocalScriptService } from '../../../../../src/service/script/LocalScript';
import { VERB_LOOK } from '../../../../../src/util/constants';
import { makeTestActor, makeTestPortal, makeTestRoom } from '../../../../entity';
import { createTestContext, createTestTransfer, getStubHelper } from '../../../../helper';

describe('portal look scripts for oven door', () => {
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

    await expect(SignalPortalLookHGOven.call(makeTestActor('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalPortalLookHGOven.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should describe the portal', async () => {
    const script = createStubInstance(LocalScriptService);
    const state = getStubHelper();
    (state.find as SinonStub).resolves([]);

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      random: createStubInstance(MathRandomService),
      room: makeTestRoom('', '', '', [], []),
      script,
      state,
    });

    await SignalPortalLookHGOven.call(makeTestPortal('', '', '', '', ''), context);

    expect(state.show).to.have.been.calledWithMatch(match.object, 'actor.step.look.room.portal');
  });

  it('should describe actors in the portal destination room', async () => {
    const script = createStubInstance(LocalScriptService);
    const state = getStubHelper();

    const portal = makeTestPortal('', '', '', '', 'foo');
    const room = makeTestRoom('foo', '', '', [], [], [portal]);

    const findStub = state.find as SinonStub;
    findStub.onFirstCall().resolves([room]);

    const actor = makeTestActor('', '', '');
    findStub.onSecondCall().resolves([actor]);

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      random: createStubInstance(MathRandomService),
      room,
      script,
      state,
    });

    await SignalPortalLookHGOven.call(portal, context);

    expect(state.show).to.have.been.calledWithMatch(match.object, 'portal.look.actor');
  });
});
