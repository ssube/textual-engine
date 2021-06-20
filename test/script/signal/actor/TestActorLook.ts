import { expect } from 'chai';
import { NullLogger } from 'noicejs';
import { createStubInstance } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { SignalActorLook } from '../../../../src/lib';
import { makeCommand } from '../../../../src/model/Command';
import { MathRandomService } from '../../../../src/service/random/MathRandom';
import { ScriptContext } from '../../../../src/service/script';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { VERB_LOOK } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity';
import { getStubHelper } from '../../../helper';
import { testTransfer } from '../../helper';

describe('actor look scripts', () => {
  it('should require the script target be an actor', async () => {
    const script = createStubInstance(LocalScriptService);
    const stateHelper = getStubHelper();
    const transfer = testTransfer();

    const context: ScriptContext = {
      command: makeCommand(VERB_LOOK),
      data: new Map(),
      logger: NullLogger.global,
      random: createStubInstance(MathRandomService),
      room: makeTestRoom('', '', '', [], []),
      script,
      state: stateHelper,
      transfer,
    };

    await expect(SignalActorLook.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalActorLook.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should describe the actor', async () => {
    const script = createStubInstance(LocalScriptService);
    const stateHelper = getStubHelper();
    const transfer = testTransfer();

    const context: ScriptContext = {
      command: makeCommand(VERB_LOOK),
      data: new Map(),
      logger: NullLogger.global,
      random: createStubInstance(MathRandomService),
      room: makeTestRoom('', '', '', [], []),
      script,
      state: stateHelper,
      transfer,
    };

    await SignalActorLook.call(makeTestActor('', '', ''), context);

    expect(stateHelper.show).to.have.been.calledWith('actor.step.look.actor.seen');
  });

  xit('should note if the actor is dead');
});
