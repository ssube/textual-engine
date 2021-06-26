import { expect } from 'chai';
import { createStubInstance, match, SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../src/model/Command';
import { Actor } from '../../../../src/model/entity/Actor';
import { VerbActorHit } from '../../../../src/script/verb/actor/ActorHit';
import { MathRandomService } from '../../../../src/service/random/MathRandom';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { SIGNAL_HIT, VERB_HIT, VERB_WAIT } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity';
import { createTestContext, createTestTransfer, getStubHelper } from '../../../helper';

describe('actor hit verb', () => {
  it('should require the script target be an actor', async () => {
    const script = createStubInstance(LocalScriptService);
    const state = getStubHelper();
    const transfer = createTestTransfer();

    const context = createTestContext({
      command: makeCommand(VERB_WAIT),
      random: createStubInstance(MathRandomService),
      room: makeTestRoom('', '', '', [], []),
      script,
      state,
      transfer,
    });

    await expect(VerbActorHit.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(VerbActorHit.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should find the target and invoke its hit signal', async () => {
    const script = createStubInstance(LocalScriptService);
    const state = getStubHelper();

    const target: Actor = makeTestActor('enemy', '', '');
    (state.find as SinonStub).resolves([target]);

    const context = createTestContext({
      command: makeCommand(VERB_HIT, target.meta.id),
      random: createStubInstance(MathRandomService),
      room: makeTestRoom('', '', '', [], []),
      script,
      state,
    });

    const weapon = makeTestItem('foo', '', '');
    weapon.slot = 'weapon';
    const actor = makeTestActor('bar', '', '', weapon);
    actor.slots.set('weapon', 'foo');

    await VerbActorHit.call(actor, context);

    expect(script.invoke).to.have.callCount(1).and.to.have.been.calledWithMatch(target, SIGNAL_HIT, match.object);
  });

  it('should show an error if the target is not found', async () => {
    const script = createStubInstance(LocalScriptService);
    const state = getStubHelper();
    (state.find as SinonStub).resolves([]);

    const context = createTestContext({
      command: makeCommand(VERB_HIT, 'foo'),
      random: createStubInstance(MathRandomService),
      room: makeTestRoom('', '', '', [], []),
      script,
      state,
    });

    await VerbActorHit.call(makeTestActor('', '', '', makeTestItem('', '', '')), context);

    expect(script.invoke).to.have.callCount(0);
    expect(state.show).to.have.callCount(1);
  });

  it('should show an error if the actor is hitting itself', async () => {
    const script = createStubInstance(LocalScriptService);
    const state = getStubHelper();
    const actor: Actor = makeTestActor('foo', '', '', makeTestItem('', '', ''));
    (state.find as SinonStub).resolves([actor]);

    const context = createTestContext({
      command: makeCommand(VERB_HIT, actor.meta.id),
      random: createStubInstance(MathRandomService),
      room: makeTestRoom('', '', '', [], []),
      script,
      state,
    });

    await VerbActorHit.call(actor, context);

    expect(script.invoke).to.have.callCount(0);
    expect(state.show).to.have.callCount(1).and.been.calledWithMatch(match.object, 'actor.step.hit.self');
  });

  it('should show an error if the actor does not have any items', async () => {
    const script = createStubInstance(LocalScriptService);
    const state = getStubHelper();
    (state.find as SinonStub).resolves([
      makeTestActor('', '', ''),
    ]);

    const context = createTestContext({
      command: makeCommand(VERB_HIT, ''),
      random: createStubInstance(MathRandomService),
      room: makeTestRoom('', '', '', [], []),
      script,
      state,
    });

    await VerbActorHit.call(makeTestActor('', '', ''), context);

    expect(script.invoke).to.have.callCount(0);
    expect(state.show).to.have.callCount(1).and.been.calledWithMatch(match.object, 'actor.step.hit.item');
  });
});
