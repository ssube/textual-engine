import { expect } from 'chai';
import { createStubInstance, SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../src/model/Command';
import { VerbActorOpen } from '../../../../src/script/verb/actor/ActorOpen';
import { VerbActorPush } from '../../../../src/script/verb/actor/ActorPush';
import { MathRandomService } from '../../../../src/service/random/MathRandom';
import { STAT_CLOSED, VERB_LOOK } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestPortal, makeTestRoom } from '../../../entity';
import { createTestContext, getStubHelper } from '../../../helper';

describe('actor push verb', () => {
  it('should require the script target be an actor', async () => {
    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      room: makeTestRoom('', '', '', [], []),
    });

    await expect(VerbActorPush.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(VerbActorPush.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should show a message when the target is not found', async () => {
    const state = getStubHelper();
    (state.find as SinonStub).resolves([]);

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      random: createStubInstance(MathRandomService),
      state,
    });

    await VerbActorPush.call(makeTestActor('', '', ''), context);

    expect(state.show).to.have.been.calledWith(context.source, 'actor.push.target');
  });

  it('should show a message when the portal is not found', async () => {
    const state = getStubHelper();
    const findStub = state.find as SinonStub;

    const actor = makeTestActor('', '', '');
    findStub.onFirstCall().resolves([actor]);
    findStub.onSecondCall().resolves([]);

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      random: createStubInstance(MathRandomService),
      state,
    });

    await VerbActorPush.call(makeTestActor('', '', ''), context);

    expect(state.show).to.have.been.calledWith(context.source, 'actor.push.portal');
  });

  it('should show a message when the destination room is not found', async () => {
    const state = getStubHelper();
    const findStub = state.find as SinonStub;

    const actor = makeTestActor('', '', '');
    findStub.onFirstCall().resolves([actor]);

    const portal = makeTestPortal('', '', '', '', '');
    findStub.onSecondCall().resolves([portal]);

    findStub.onThirdCall().resolves([]);

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      random: createStubInstance(MathRandomService),
      state,
    });

    await VerbActorPush.call(makeTestActor('', '', ''), context);

    expect(state.show).to.have.been.calledWith(context.source, 'actor.push.dest');
  });

  it('should move the target actor through the portal', async () => {
    const state = getStubHelper();
    const findStub = state.find as SinonStub;

    const actor = makeTestActor('', '', '');
    findStub.onFirstCall().resolves([actor]);

    const portal = makeTestPortal('', '', '', '', '');
    findStub.onSecondCall().resolves([portal]);

    const room = makeTestRoom('', '', '');
    findStub.onThirdCall().resolves([room]);

    const source = makeTestRoom('', '', '');
    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      random: createStubInstance(MathRandomService),
      room: source,
      state,
    });

    await VerbActorPush.call(makeTestActor('', '', ''), context);

    expect(state.move).to.have.been.calledWith({
      moving: actor,
      source: room,
      target: room,
    });
  });
});
