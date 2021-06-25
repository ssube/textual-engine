import { expect } from 'chai';
import { createStubInstance, match, SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../src/model/Command';
import { VerbActorTake } from '../../../../src/script/verb/actor/ActorTake';
import { MathRandomService } from '../../../../src/service/random/MathRandom';
import { VERB_TAKE } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity';
import { createTestContext, createTestTransfer, getStubHelper } from '../../../helper';

describe('actor take verb', () => {
  it('should require the script target be an actor', async () => {
    const context = createTestContext({
      command: makeCommand(VERB_TAKE),
    });

    await expect(VerbActorTake.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(VerbActorTake.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should show an error if the target is not an item', async () => {
    const state = getStubHelper();
    (state.find as SinonStub).returns(Promise.resolve([
      makeTestActor('', '', ''),
    ]));

    const context = createTestContext({
      command: makeCommand(VERB_TAKE, 'foo'),
      random: createStubInstance(MathRandomService),
      room: makeTestRoom('', '', '', [], []),
      state,
    });

    await VerbActorTake.call(makeTestActor('', '', ''), context);

    expect(state.show).to.have.callCount(1).and.been.calledWithMatch(match.object, 'actor.step.take.type');
  });

  it('should transfer items from the target room', async () => {
    const state = getStubHelper();
    const transfer = createTestTransfer();

    const item = makeTestItem('foo', '', '');
    (state.find as SinonStub).returns(Promise.resolve([item]));

    const room = makeTestRoom('', '', '', [], [item]);
    const context = createTestContext({
      command: makeCommand(VERB_TAKE, item.meta.id),
      random: createStubInstance(MathRandomService),
      room,
      state,
      transfer,
    });

    const actor = makeTestActor('', '', '');
    await VerbActorTake.call(actor, context);

    expect(transfer.moveItem).to.have.been.calledWith({
      moving: item,
      source: room,
      target: actor,
    });
  });
});
