import { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError.js';
import { makeCommand } from '../../../../src/model/Command.js';
import { VerbActorTake } from '../../../../src/script/verb/actor/ActorTake.js';
import { VERB_TAKE } from '../../../../src/util/constants.js';
import { findMatching } from '../../../../src/util/entity/find.js';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity.js';
import { createTestContext, getStubHelper } from '../../../helper.js';

const { match } = sinon;

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
    (state.find as SinonStub).resolves([
      makeTestActor('', '', ''),
    ]);

    const context = createTestContext({
      command: makeCommand(VERB_TAKE, 'foo'),
      room: makeTestRoom('', '', '', [], []),
      state,
    });

    await VerbActorTake.call(makeTestActor('', '', ''), context);

    expect(state.show).to.have.callCount(1).and.been.calledWithMatch(match.object, 'actor.verb.take.type');
  });

  it('should transfer items from the target room', async () => {
    const state = getStubHelper();

    const item = makeTestItem('foo', '', '');
    (state.find as SinonStub).resolves([item]);

    const room = makeTestRoom('', '', '', [], [item]);
    const context = createTestContext({
      command: makeCommand(VERB_TAKE, item.meta.id),
      room,
      state,
    });

    const actor = makeTestActor('', '', '');
    await VerbActorTake.call(actor, context);

    expect(state.move).to.have.been.calledWith({
      moving: item,
      source: room,
      target: actor,
    });
  });

  it('should only take items from the room', async () => {
    const rooms = [
      makeTestRoom('', '', '', [
        makeTestActor('', '', '', makeTestItem('foo', 'foo', 'foo')),
      ], [
        makeTestItem('bar', 'bar', 'bar'),
      ]),
    ];
    const state = getStubHelper();
    const showStub = state.show as SinonStub;
    (state.find as SinonStub).callsFake((search) => findMatching(rooms, search));

    await VerbActorTake.call(makeTestActor('', '', ''), createTestContext({
      command: makeCommand(VERB_TAKE, 'bar'),
      room: rooms[0],
      state,
    }));

    expect(showStub, 'from room inventory').to.have.callCount(0);

    await VerbActorTake.call(makeTestActor('', '', ''), createTestContext({
      command: makeCommand(VERB_TAKE, 'foo'),
      room: rooms[0],
      state,
    }));

    expect(showStub, 'from other actor inventory').to.have.callCount(1).and.been.calledWithMatch(match.object, 'actor.verb.take.type');
  });
});
