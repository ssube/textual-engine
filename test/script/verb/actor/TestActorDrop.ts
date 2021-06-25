import { expect } from 'chai';
import { createStubInstance, match, SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand, makeCommandIndex } from '../../../../src/model/Command';
import { VerbActorDrop } from '../../../../src/script/verb/actor/ActorDrop';
import { MathRandomService } from '../../../../src/service/random/MathRandom';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { VERB_DROP, VERB_WAIT } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity';
import { createTestContext, createTestTransfer, getStubHelper } from '../../../helper';

describe('actor drop verb', () => {
  it('should require the target be an actor', async () => {
    const context = createTestContext({
      command: makeCommand(VERB_WAIT),
      room: makeTestRoom('', '', '', [], []),
    });

    await expect(VerbActorDrop.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(VerbActorDrop.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should find the target by id', async () => {
    const state = getStubHelper();
    const transfer = createTestTransfer();

    const items = [
      makeTestItem('foo-1', '', ''),
      makeTestItem('foo-2', '', ''),
      makeTestItem('bar-1', '', ''),
    ];
    (state.find as SinonStub).returns(Promise.resolve(items));

    const actor = makeTestActor('', '', '', items[0]);
    const context = createTestContext({
      command: makeCommand(VERB_DROP, items[0].meta.id),
      room: makeTestRoom('', '', '', [], []),
      state,
      transfer,
    });
    await VerbActorDrop.call(actor, context);
    expect(transfer.moveItem).to.have.been.calledWithMatch({
      moving: items[0],
      source: match.object,
      target: match.object,
    });
  });

  it('should find the target by name', async () => {
    const script = createStubInstance(LocalScriptService);
    const state = getStubHelper();
    const transfer = createTestTransfer();

    const items = [
      makeTestItem('foo-1', 'foo bob', ''),
      makeTestItem('foo-2', 'foo bin', ''),
      makeTestItem('bar-1', 'bar bin', ''),
    ];
    (state.find as SinonStub).returns(Promise.resolve(items));

    const actor = makeTestActor('', '', '', items[0]);
    const context = createTestContext({
      command: makeCommand(VERB_DROP, 'bob'),
      random: createStubInstance(MathRandomService),
      room: makeTestRoom('', '', '', [], []),
      script,
      state,
      transfer,
    });

    await VerbActorDrop.call(actor, context);

    expect(transfer.moveItem).to.have.been.calledWithMatch({
      moving: items[0],
      source: match.object,
      target: match.object,
    });
  });

  it('should use the command index', async () => {
    const state = getStubHelper();
    const transfer = createTestTransfer();

    const items = [
      makeTestItem('foo-1', 'foo bob', ''),
      makeTestItem('foo-2', 'foo bin', ''),
      makeTestItem('bar-1', 'bar bin', ''),
    ];
    (state.find as SinonStub).returns(Promise.resolve(items));

    const actor = makeTestActor('', '', '', items[0]);
    const context = createTestContext({
      command: makeCommandIndex(VERB_DROP, 1, 'foo'),
      random: createStubInstance(MathRandomService),
      room: makeTestRoom('', '', '', [], []),
      state,
      transfer,
    });

    await VerbActorDrop.call(actor, context);

    expect(transfer.moveItem).to.have.been.calledWithMatch({
      moving: items[1],
      source: match.object,
      target: match.object,
    });
  });

  it('should show an error if the target was not found', async () => {
    const state = getStubHelper();
    (state.find as SinonStub).returns(Promise.resolve([]));

    const transfer = createTestTransfer();

    const actor = makeTestActor('', '', '');
    const context = createTestContext({
      command: makeCommandIndex(VERB_DROP, 1, 'foo'),
      room: makeTestRoom('', '', '', [], []),
      state,
      transfer,
    });

    await VerbActorDrop.call(actor, context);
    expect(transfer.moveItem).to.have.callCount(0);
    expect(state.show).to.have.callCount(1);
  });
});
