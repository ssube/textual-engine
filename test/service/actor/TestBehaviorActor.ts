import { mustExist, NotImplementedError } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { BaseOptions } from 'noicejs';

import { ConfigError } from '../../../src/error/ConfigError.js';
import { ActorSource } from '../../../src/model/entity/Actor.js';
import { INJECT_EVENT, INJECT_RANDOM } from '../../../src/module/index.js';
import { CoreModule } from '../../../src/module/CoreModule.js';
import { BehaviorActorService } from '../../../src/service/actor/BehaviorActor.js';
import { ActorCommandEvent } from '../../../src/service/actor/events.js';
import { EventBus } from '../../../src/service/event/index.js';
import { MathRandomService } from '../../../src/service/random/MathRandom.js';
import { onceEvent } from '../../../src/util/async/event.js';
import { EVENT_ACTOR_COMMAND, EVENT_STATE_ROOM, VERB_HIT, VERB_MOVE, VERB_WAIT } from '../../../src/util/constants.js';
import { makeTestActor, makeTestPortal, makeTestRoom } from '../../entity.js';
import { createStubInstance, getTestContainer, stub } from '../../helper.js';

describe('behavior actor', () => {
  it('should respond to room events for non-player actors with a command for the same actor', async () => {
    const container = await getTestContainer(new CoreModule());

    const actorService = await container.create(BehaviorActorService, {
      config: {
        throttle: 10,
      },
    });
    await actorService.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const pending = onceEvent<ActorCommandEvent>(events, EVENT_ACTOR_COMMAND);

    const actor = makeTestActor('', '', '');
    const room = makeTestRoom('', '', '');
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
    const container = await getTestContainer(new CoreModule());

    const actorService = await container.create(BehaviorActorService, {
      config: {
        throttle: 10,
      },
    });
    await actorService.start();
    await actorService.stop();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    expect(events.listenerCount(EVENT_STATE_ROOM)).to.equal(0);
  });

  it('should not implement the last command method', async () => {
    const container = await getTestContainer(new CoreModule());

    const actorService = await container.create(BehaviorActorService, {
      config: {
        throttle: 10,
      },
    });
    await actorService.start();

    return expect(actorService.last()).to.eventually.be.rejectedWith(NotImplementedError);
  });

  it('should attack players in the same room', async () => {
    const container = await getTestContainer(new CoreModule());

    const actorService = await container.create(BehaviorActorService, {
      config: {
        throttle: 10,
      },
    });
    await actorService.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const pendingCommand = onceEvent<ActorCommandEvent>(events, EVENT_ACTOR_COMMAND);

    const player = makeTestActor('foo', 'bar', '');
    player.source = ActorSource.PLAYER;

    events.emit(EVENT_STATE_ROOM, {
      actor: makeTestActor('', '', ''),
      room: makeTestRoom('', '', '', [player], []),
    });

    const commandEvent = await pendingCommand;
    expect(commandEvent.command.targets, 'targets').to.include(player.meta.id);
    expect(commandEvent.command.verb, 'verb').to.equal(VERB_HIT);
  });

  it('should move into other rooms on a low roll', async () => {
    const container = await getTestContainer(new CoreModule());

    const random = createStubInstance(MathRandomService);
    random.nextFloat.returns(0); // low roll should move
    random.nextInt.returns(0); // pick the first portal

    const actorService = await container.create(BehaviorActorService, {
      [INJECT_RANDOM]: random,
      config: {
        throttle: 10,
      },
    });
    await actorService.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const pendingCommand = onceEvent<ActorCommandEvent>(events, EVENT_ACTOR_COMMAND);

    const portal = makeTestPortal('foo', 'door', 'west', 'east', 'foo');
    const room = makeTestRoom('', '', '', [], []);
    room.portals.push(portal);

    events.emit(EVENT_STATE_ROOM, {
      actor: makeTestActor('', '', ''),
      room,
    });

    const commandEvent = await pendingCommand;
    expect(commandEvent.command.targets, 'targets').to.include(portal.meta.id);
    expect(commandEvent.command.verb).to.equal(VERB_MOVE);
  });

  it('should ignore room events for player actors', async () => {
    const container = await getTestContainer(new CoreModule());

    const actorService = await container.create(BehaviorActorService, {
      config: {
        attack: 0.5,
        wander: 0.5,
      },
    });
    await actorService.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);

    const actorCommandStub = stub();
    events.on(EVENT_ACTOR_COMMAND, actorCommandStub);

    const actor = makeTestActor('', '', '');
    actor.source = ActorSource.PLAYER;

    const room = makeTestRoom('', '', '');
    events.emit(EVENT_STATE_ROOM, {
      actor,
      room,
    });

    expect(actorCommandStub).to.have.callCount(0);
  });

  it('should validate the provided config', async () => {
    const container = await getTestContainer(new CoreModule());

    return expect(container.create(BehaviorActorService, {
      config: {
        attack: 'test',
        wander: undefined,
      },
    })).to.eventually.be.rejectedWith(ConfigError);
  });
});
