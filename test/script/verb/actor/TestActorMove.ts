import { NotFoundError } from '@apextoaster/js-utils';
import { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError.js';
import { makeCommand } from '../../../../src/model/Command.js';
import { ActorSource } from '../../../../src/model/entity/Actor.js';
import { ROOM_TYPE } from '../../../../src/model/entity/Room.js';
import { VerbActorMove } from '../../../../src/script/verb/actor/ActorMove.js';
import { SIGNAL_LOOK, STAT_LOCKED, VERB_MOVE, VERB_WAIT } from '../../../../src/util/constants.js';
import { makeTestActor, makeTestItem, makeTestPortal, makeTestRoom } from '../../../entity.js';
import { createTestContext, getStubHelper } from '../../../helper.js';

const { match } = sinon;

describe('actor move verb', () => {
  it('should require the script target be an actor', async () => {
    const context = createTestContext({
      command: makeCommand(VERB_WAIT),
      room: makeTestRoom('', '', '', [], []),
    });

    await expect(VerbActorMove.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(VerbActorMove.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should target portals by name and move the actor', async () => {
    const state = getStubHelper();
    const target = makeTestRoom('', '', '', [], []);
    (state.find as SinonStub).resolves([target]);

    const actor = makeTestActor('', '', '');
    const room = makeTestRoom('', '', '', [actor], []);
    const portal = makeTestPortal('', 'door', 'west', 'east', 'foo');
    room.portals.push(portal);

    const context = createTestContext({
      command: makeCommand(VERB_MOVE, portal.meta.name),
      room,
      state,
    });

    await VerbActorMove.call(actor, context);

    expect(room.actors, 'target actors').to.have.lengthOf(1);
    expect(state.find).to.have.been.calledWith({
      meta: {
        id: 'foo',
      },
      type: ROOM_TYPE,
    });
    expect(state.show).to.have.been.calledWithMatch(match.object, 'actor.verb.move.portal');
  });

  it('should target portals by source group', async () => {
    const state = getStubHelper();
    const target = makeTestRoom('', '', '', [], []);
    (state.find as SinonStub).resolves([target]);

    const actor = makeTestActor('', '', '');
    const room = makeTestRoom('', '', '', [actor], []);
    const portal = makeTestPortal('', 'door', 'west', 'east', 'foo');
    room.portals.push(portal);
    const context = createTestContext({
      command: makeCommand(VERB_MOVE, portal.group.source),
      room,
      state,
    });

    await VerbActorMove.call(actor, context);

    expect(room.actors, 'target actors').to.have.lengthOf(1);
    expect(state.find).to.have.been.calledWith({
      meta: {
        id: 'foo',
      },
      type: ROOM_TYPE,
    });
    expect(state.show).to.have.been.calledWithMatch(match.object, 'actor.verb.move.portal');
  });

  it('should target portals by source group and name', async () => {
    const state = getStubHelper();
    const target = makeTestRoom('', '', '', [], []);
    (state.find as SinonStub).resolves([target]);

    const actor = makeTestActor('', '', '');
    const room = makeTestRoom('', '', '', [actor], []);
    const portal = makeTestPortal('', 'door', 'west', 'east', 'foo');
    room.portals.push(portal);
    const context = createTestContext({
      command: makeCommand(VERB_MOVE, `${portal.group.source} ${portal.meta.name}`),
      room,
      state,
    });

    await VerbActorMove.call(actor, context);

    expect(room.actors, 'target actors').to.have.lengthOf(1);
    expect(state.find).to.have.been.calledWith({
      meta: {
        id: 'foo',
      },
      type: ROOM_TYPE,
    });
    expect(state.show).to.have.been.calledWithMatch(match.object, 'actor.verb.move.portal');
  });

  it('should show a message if the portal cannot be found', async () => {
    const state = getStubHelper();
    const target = makeTestRoom('', '', '', [], []);
    (state.find as SinonStub).resolves([target]);

    const actor = makeTestActor('', '', '');
    const room = makeTestRoom('', '', '', [actor], []);
    const context = createTestContext({
      command: makeCommand(VERB_MOVE, 'door'),
      room,
      state,
    });

    await VerbActorMove.call(actor, context);

    expect(state.show).to.have.been.calledWithMatch(match.object, 'actor.verb.move.missing');
  });

  it('should throw an error if the target room cannot be found', async () => {
    const state = getStubHelper();
    (state.find as SinonStub).resolves([]);

    const actor = makeTestActor('', '', '');
    const room = makeTestRoom('', '', '', [actor], []);
    const portal = makeTestPortal('', 'door', 'west', 'east', 'foo');
    room.portals.push(portal);

    const context = createTestContext({
      command: makeCommand(VERB_MOVE, `${portal.group.source} ${portal.meta.name}`),
      room,
      state,
    });

    return expect(VerbActorMove.call(actor, context)).to.eventually.be.rejectedWith(NotFoundError);
  });

  it('should look at the destination room when the moving actor is a player', async () => {
    const state = getStubHelper();
    const target = makeTestRoom('', '', '', [], []);
    (state.find as SinonStub).resolves([target]);

    const actor = makeTestActor('', '', '');
    actor.source = ActorSource.PLAYER;

    const room = makeTestRoom('', '', '', [actor], []);
    const portal = makeTestPortal('', 'door', 'west', 'east', 'foo');
    room.portals.push(portal);

    const context = createTestContext({
      command: makeCommand(VERB_MOVE, portal.meta.name),
      room,
      state,
    });

    await VerbActorMove.call(actor, context);

    expect(context.script.invoke).to.have.been.calledWith(target, SIGNAL_LOOK, context);
  });

  it('should show a message if the portal is locked', async () => {
    const state = getStubHelper();
    const target = makeTestRoom('', '', '', [], []);
    (state.find as SinonStub).resolves([target]);

    const actor = makeTestActor('', '', '');
    const portal = makeTestPortal('', 'door', 'west', 'east', 'foo');
    portal.stats.set(STAT_LOCKED, 1);
    const room = makeTestRoom('', '', '', [actor], [], [portal]);

    const context = createTestContext({
      command: makeCommand(VERB_MOVE, `${portal.group.source} ${portal.meta.name}`),
      room,
      state,
    });

    await VerbActorMove.call(actor, context);

    expect(state.show).to.have.been.calledWithMatch(match.object, 'actor.verb.move.locked');
  });

  it('should leave breadcrumbs when the leader flag is set', async () => {
    const state = getStubHelper();
    const target = makeTestRoom('', '', '', [], []);
    (state.find as SinonStub).resolves([target]);

    const actor = makeTestActor('', '', '');
    actor.flags.set('leader', 'path-test');
    const portal = makeTestPortal('foo', 'door', 'west', 'east', 'foo');
    const room = makeTestRoom('', '', '', [actor], [], [portal]);

    const context = createTestContext({
      command: makeCommand(VERB_MOVE, `${portal.group.source} ${portal.meta.name}`),
      room,
      state,
    });

    await VerbActorMove.call(actor, context);

    expect(room.flags.get('path-test')).to.equal('foo');
  });
});
