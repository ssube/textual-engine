import { expect } from 'chai';
import { NullLogger } from 'noicejs';
import { createStubInstance, SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../src/model/Command';
import { SignalPortalLook } from '../../../../src/script/signal/portal/PortalLook';
import { MathRandomGenerator } from '../../../../src/service/random/MathRandom';
import { ScriptContext } from '../../../../src/service/script';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { VERB_LOOK } from '../../../../src/util/constants';
import { makeTestActor, makeTestPortal, makeTestRoom } from '../../../entity';
import { getStubHelper } from '../../../helper';
import { testTransfer } from '../../helper';

describe('portal look scripts', () => {
  it('should require the script target be a portal', async () => {
    const script = createStubInstance(LocalScriptService);
    const stateHelper = getStubHelper();
    const transfer = testTransfer();

    const context: ScriptContext = {
      command: makeCommand(VERB_LOOK),
      data: new Map(),
      logger: NullLogger.global,
      random: createStubInstance(MathRandomGenerator),
      room: makeTestRoom('', '', '', [], []),
      script,
      state: stateHelper,
      transfer,
    };

    await expect(SignalPortalLook.call(makeTestActor('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalPortalLook.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should describe the portal', async () => {
    const script = createStubInstance(LocalScriptService);
    const stateHelper = getStubHelper();
    const transfer = testTransfer();

    const context: ScriptContext = {
      command: makeCommand(VERB_LOOK),
      data: new Map(),
      logger: NullLogger.global,
      random: createStubInstance(MathRandomGenerator),
      room: makeTestRoom('', '', '', [], []),
      script,
      state: stateHelper,
      transfer,
    };

    await SignalPortalLook.call(makeTestPortal('', '', '', '', ''), context);

    expect(stateHelper.show).to.have.been.calledWith('actor.step.look.room.portal');
  });

  it('should describe the portal destination room', async () => {
    const script = createStubInstance(LocalScriptService);
    const stateHelper = getStubHelper();
    const transfer = testTransfer();

    const portal = makeTestPortal('', '', '', '', 'foo');
    const room = makeTestRoom('foo', '', '', [], [], [portal]);
    (stateHelper.find as SinonStub).returns(Promise.resolve([room]));

    const context: ScriptContext = {
      command: makeCommand(VERB_LOOK),
      data: new Map(),
      logger: NullLogger.global,
      random: createStubInstance(MathRandomGenerator),
      room,
      script,
      state: stateHelper,
      transfer,
    };

    await SignalPortalLook.call(portal, context);

    expect(stateHelper.show).to.have.been.calledWith('actor.step.look.room.portal');
  });
});
