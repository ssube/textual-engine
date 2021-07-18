import { expect } from 'chai';
import { ConsoleLogger } from 'noicejs';
import { match, SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../src/model/Command';
import { VerbActorEquip } from '../../../../src/script/verb/actor/ActorEquip';
import { VERB_EQUIP, VERB_WAIT } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity';
import { createTestContext, getStubHelper } from '../../../helper';

describe('actor equip verb', () => {
  it('should require the target be an actor', async () => {
    const context = createTestContext({
      command: makeCommand(VERB_WAIT),
      room: makeTestRoom('', '', '', [], []),
    });

    await expect(VerbActorEquip.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(VerbActorEquip.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should equip items into the item slot when no target is given', async () => {
    const slot = 'hand';
    const item = makeTestItem('foo', '', '');
    item.slot = slot;
    const actor = makeTestActor('', '', '', item);
    actor.slots.set(slot, '');

    const state = getStubHelper();
    (state.find as SinonStub).resolves([
      item,
    ]);

    const context = createTestContext({
      command: makeCommand(VERB_EQUIP, item.meta.id),
      room: makeTestRoom('', '', '', [actor], []),
      state,
    });
    await VerbActorEquip.call(actor, context);

    expect(actor.slots.get(slot)).to.equal(item.meta.id);
    expect(state.show).to.have.been.calledWithMatch(match.object, 'actor.verb.equip.item');
  });

  it('should show a message when the slot does not exist', async () => {
    const state = getStubHelper();

    const context = createTestContext({
      command: makeCommand(VERB_EQUIP, 'foo'),
      room: makeTestRoom('', '', '', [], []),
      state,
    });

    const slot = 'hand';
    const item = makeTestItem('foo', '', '');
    item.slot = slot;
    const actor = makeTestActor('', '', '', item);

    (state.find as SinonStub).resolves([
      item,
    ]);

    await VerbActorEquip.call(actor, context);

    expect(state.show).to.have.been.calledWithMatch(match.object, 'actor.verb.equip.slot.missing');
  });

  it('should show a message when the item does not exist', async () => {
    const state = getStubHelper();
    (state.find as SinonStub).resolves([]);

    const context = createTestContext({
      command: makeCommand(VERB_EQUIP, 'foo'),
      room: makeTestRoom('', '', '', [], []),
      state,
    });

    const slot = 'hand';
    const actor = makeTestActor('', '', '');
    actor.slots.set(slot, '');

    await VerbActorEquip.call(actor, context);

    expect(state.show).to.have.been.calledWithMatch(match.object, 'actor.verb.equip.missing');
  });

  it('should show a message when the target slot does not match the item slot', async () => {
    const slot = 'hand';
    const item = makeTestItem('foo', '', '');
    item.slot = slot;

    const state = getStubHelper();
    (state.find as SinonStub).resolves([item]);

    const context = createTestContext({
      command: makeCommand(VERB_EQUIP, 'foo', 'teeth'),
      room: makeTestRoom('', '', '', [], []),
      state,
    });

    const actor = makeTestActor('', '', '', item);
    actor.slots.set(slot, '');

    await VerbActorEquip.call(actor, context);

    expect(state.show).to.have.been.calledWithMatch(match.object, 'actor.verb.equip.slot.invalid');
  });

  xit('should equip items into the target slot');
  xit('should only equip an item into one slot at a time');
});
