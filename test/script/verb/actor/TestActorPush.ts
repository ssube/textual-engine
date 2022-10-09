import { expect } from 'chai';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError.js';
import { makeCommand } from '../../../../src/model/Command.js';
import { VerbActorPush } from '../../../../src/script/verb/actor/ActorPush.js';
import { STAT_CLOSED, STAT_LOCKED, VERB_LOOK } from '../../../../src/util/constants.js';
import { makeTestActor, makeTestItem, makeTestPortal, makeTestRoom } from '../../../entity.js';
import { createTestContext, getStubHelper, SinonStub } from '../../../helper.js';

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
      state,
    });

    await VerbActorPush.call(makeTestActor('', '', ''), context);

    expect(state.show).to.have.been.calledWith(context.source, 'actor.verb.push.target');
  });

  it('should show a message when the portal is not found', async () => {
    const state = getStubHelper();
    const findStub = state.find as SinonStub;

    const actor = makeTestActor('', '', '');
    findStub.onFirstCall().resolves([actor]);
    findStub.onSecondCall().resolves([]);

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      state,
    });

    await VerbActorPush.call(makeTestActor('', '', ''), context);

    expect(state.show).to.have.been.calledWith(context.source, 'actor.verb.push.portal');
  });

  it('should show a message when the portal is closed', async () => {
    const state = getStubHelper();
    const findStub = state.find as SinonStub;

    const actor = makeTestActor('', '', '');
    findStub.onFirstCall().resolves([actor]);

    const portal = makeTestPortal('', '', '', '', '');
    portal.stats.set(STAT_CLOSED, 1);
    findStub.onSecondCall().resolves([portal]);

    findStub.onThirdCall().resolves([]);

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      state,
    });

    await VerbActorPush.call(makeTestActor('', '', ''), context);

    expect(state.show).to.have.been.calledWith(context.source, 'actor.verb.push.closed');
  });


  it('should show a message when the portal is locked', async () => {
    const state = getStubHelper();
    const findStub = state.find as SinonStub;

    const actor = makeTestActor('', '', '');
    findStub.onFirstCall().resolves([actor]);

    const portal = makeTestPortal('', '', '', '', '');
    portal.stats.set(STAT_LOCKED, 1);
    findStub.onSecondCall().resolves([portal]);

    findStub.onThirdCall().resolves([]);

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      state,
    });

    await VerbActorPush.call(makeTestActor('', '', ''), context);

    expect(state.show).to.have.been.calledWith(context.source, 'actor.verb.push.locked');
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
      state,
    });

    await VerbActorPush.call(makeTestActor('', '', ''), context);

    expect(state.show).to.have.been.calledWith(context.source, 'actor.verb.push.dest.missing');
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
