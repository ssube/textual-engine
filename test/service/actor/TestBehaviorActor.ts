import { mustExist, NotImplementedError } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { BaseOptions, Container, NullLogger } from 'noicejs';
import { createStubInstance } from 'sinon';

import { Actor, ActorSource } from '../../../src/model/entity/Actor';
import { Room } from '../../../src/model/entity/Room';
import { INJECT_EVENT, INJECT_RANDOM } from '../../../src/module';
import { CoreModule } from '../../../src/module/CoreModule';
import { BehaviorActorService } from '../../../src/service/actor/BehaviorActor';
import { ActorCommandEvent } from '../../../src/service/actor/events';
import { EventBus } from '../../../src/service/event';
import { MathRandomGenerator } from '../../../src/service/random/MathRandom';
import { onceEvent } from '../../../src/util/async/event';
import { EVENT_ACTOR_COMMAND, EVENT_STATE_ROOM, VERB_HIT, VERB_MOVE, VERB_WAIT } from '../../../src/util/constants';
import { makeTestActor, makeTestPortal, makeTestRoom } from '../../entity';

describe('behavior actor', () => {
  it('should respond to room events for non-player actors with a command for the same actor', async () => {
    const container = Container.from(new CoreModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const actorService = await container.create(BehaviorActorService);
    await actorService.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const pending = onceEvent<ActorCommandEvent>(events, EVENT_ACTOR_COMMAND);

    const actor: Actor = {
      items: [],
      meta: {
        desc: '',
        id: '',
        name: '',
        template: '',
      },
      scripts: new Map(),
      slots: new Map(),
      source: ActorSource.BEHAVIOR,
      stats: new Map(),
      type: 'actor',
    };
    const room: Room = {
      actors: [],
      items: [],
      meta: {
        desc: '',
        id: '',
        name: '',
        template: '',
      },
      portals: [],
      scripts: new Map(),
      type: 'room',
    };
    events.emit(EVENT_STATE_ROOM, {
      actor,
      room,
    });

    const commandEvent = await pending;
    expect(commandEvent.command.verb).to.equal(VERB_WAIT);
    expect(commandEvent).to.have.ownProperty('actor');

    const commandActor = mustExist(commandEvent.actor);
    expect(commandActor.meta.id).to.equal(actor.meta.id);
  });

  it('should detach from events when stopped', async () => {
    const container = Container.from(new CoreModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const actorService = await container.create(BehaviorActorService);
    await actorService.start();
    await actorService.stop();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    expect(events.listenerCount(EVENT_STATE_ROOM)).to.equal(0);
  });

  it('should not implement the last command method', async () => {
    const container = Container.from(new CoreModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const actorService = await container.create(BehaviorActorService);
    await actorService.start();

    return expect(actorService.last()).to.eventually.be.rejectedWith(NotImplementedError);
  });

  it('should attack players in the same room', async () => {
    const container = Container.from(new CoreModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const actorService = await container.create(BehaviorActorService);
    await actorService.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const pendingCommand = onceEvent<ActorCommandEvent>(events, EVENT_ACTOR_COMMAND);

    const player = makeTestActor('foo', 'bar', '');
    player.source = ActorSource.PLAYER;

    events.emit(EVENT_STATE_ROOM, {
      actor: makeTestActor('', '', ''),
      room: makeTestRoom('', '', '', [player], []),
    });

    return expect(pendingCommand).to.eventually.deep.include({
      command: {
        index: 0,
        input: `${VERB_HIT} ${player.meta.id}`,
        target: player.meta.id,
        verb: VERB_HIT,
      },
    });
  });

  it('should move into other rooms on a low roll', async () => {
    const container = Container.from(new CoreModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const random = createStubInstance(MathRandomGenerator);
    random.nextFloat.returns(0); // low roll should move
    random.nextInt.returns(0); // pick the first portal

    const actorService = await container.create(BehaviorActorService, {
      [INJECT_RANDOM]: random,
    });
    await actorService.start();

    // TODO: find a better way to check/don't
    if (Reflect.get(actorService, 'random') !== random) {
      throw new Error('wrong random');
    }

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const pendingCommand = onceEvent<ActorCommandEvent>(events, EVENT_ACTOR_COMMAND);

    const portal = makeTestPortal('foo', 'door', 'west', 'east', 'foo');
    const room = makeTestRoom('', '', '', [], []);
    room.portals.push(portal);

    events.emit(EVENT_STATE_ROOM, {
      actor: makeTestActor('', '', ''),
      room,
    });

    return expect(pendingCommand).to.eventually.deep.include({
      command: {
        index: 0,
        input: `${VERB_MOVE} ${portal.meta.id}`,
        target: portal.meta.id,
        verb: VERB_MOVE,
      },
    });
  });
});
