import { expect } from 'chai';
import { createStubInstance, match } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { SignalActorLook } from '../../../../src/lib';
import { makeCommand } from '../../../../src/model/Command';
import { MathRandomService } from '../../../../src/service/random/MathRandom';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { STAT_HEALTH, VERB_LOOK } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity';
import { createTestContext, createTestTransfer, getStubHelper } from '../../../helper';

describe('actor look signal', () => {
  it('should require the script target be an actor', async () => {
    const state = getStubHelper();

    const room = makeTestRoom('', '', '', [], []);
    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      random: createStubInstance(MathRandomService),
      room,
      source: {
        room,
      },
      state,
    });

    await expect(SignalActorLook.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalActorLook.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should describe the actor', async () => {
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

    const actor = makeTestActor('', '', '');
    actor.stats.set(STAT_HEALTH, 1);
    await SignalActorLook.call(actor, context);

    expect(state.show).to.have.been.calledWithMatch(match.object, 'actor.step.look.actor.seen');
  });

  it('should note if the actor is dead', async () => {
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

    await SignalActorLook.call(makeTestActor('', '', ''), context);

    expect(state.show).to.have.been.calledWithMatch(match.object, 'actor.step.look.actor.seen');
  });
});
