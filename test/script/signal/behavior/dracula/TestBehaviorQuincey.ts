import { expect } from 'chai';

import { ScriptTargetError } from '../../../../../src/error/ScriptTargetError.js';
import { makeCommand } from '../../../../../src/model/Command.js';
import { SignalBehaviorDraculaQuincey } from '../../../../../src/script/signal/behavior/dracula/BehaviorQuincey.js';
import { VERB_LOOK, VERB_MOVE, VERB_WAIT } from '../../../../../src/util/constants.js';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../../entity.js';
import { createStubBehavior, createTestContext, getStubHelper, match, SinonStub } from '../../../../helper.js';

describe('actor behavior signal for Quincey Morris', () => {
  it('should require the script target be an actor', async () => {
    const state = getStubHelper();

    const room = makeTestRoom('', '', '', [], []);
    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      room,
      source: {
        room,
      },
      state,
    });

    await expect(SignalBehaviorDraculaQuincey.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalBehaviorDraculaQuincey.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should move into the hallway after some turns', async () => {
    const behavior = createStubBehavior();
    const queueStub = behavior.queue as SinonStub;

    const introRoom = makeTestRoom('intro-quincey', '', '', [], []);
    const context = createTestContext({
      behavior,
      command: makeCommand(VERB_LOOK),
      room: introRoom,
      source: {
        room: introRoom,
      },
    });

    const quincey = makeTestActor('', '', '');

    await SignalBehaviorDraculaQuincey.call(quincey, context);
    expect(queueStub).to.have.callCount(1).and.been.calledWithMatch(quincey, match.has('verb', VERB_WAIT));
    queueStub.resetHistory();

    await SignalBehaviorDraculaQuincey.call(quincey, {
      ...context,
      step: {
        time: 20,
        turn: 20,
      },
    });
    expect(queueStub).to.have.callCount(1).and.been.calledWithMatch(quincey, match.has('verb', VERB_MOVE));
    queueStub.resetHistory();
  });

  xit('should give blood to Lucy when the player arrives');
});
