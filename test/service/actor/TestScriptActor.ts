import { mustExist, NotImplementedError } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { BaseOptions } from 'noicejs';
import { match, stub } from 'sinon';

import { ConfigError } from '../../../src/error/ConfigError';
import { ActorSource } from '../../../src/model/entity/Actor';
import { INJECT_EVENT, INJECT_SCRIPT } from '../../../src/module';
import { CoreModule } from '../../../src/module/CoreModule';
import { ActorCommandEvent } from '../../../src/service/actor/events';
import { ScriptActorService } from '../../../src/service/actor/ScriptActor';
import { EventBus } from '../../../src/service/event';
import { ScriptService } from '../../../src/service/script';
import { onceEvent } from '../../../src/util/async/event';
import { EVENT_ACTOR_COMMAND, EVENT_STATE_ROOM, EVENT_STATE_STEP, VERB_WAIT } from '../../../src/util/constants';
import { makeTestActor, makeTestRoom } from '../../entity';
import { getTestContainer } from '../../helper';

describe('script actor', () => {
  it('should invoke the behavior signal on room events', async () => {
    const container = await getTestContainer(new CoreModule());

    const actorService = await container.create(ScriptActorService, {
      config: {
        attack: 0.5,
        wander: 0.5,
      },
    });
    await actorService.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const pending = onceEvent<ActorCommandEvent>(events, EVENT_ACTOR_COMMAND);

    const actor = makeTestActor('', '', '');
    actor.scripts.set('signal.behavior', {
      data: new Map(),
      name: 'signal-behavior-enemy',
    });

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

    const actorService = await container.create(ScriptActorService, {
      config: {},
    });
    await actorService.start();
    await actorService.stop();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    expect(events.listenerCount(EVENT_STATE_ROOM)).to.equal(0);
  });

  it('should not implement the last command method', async () => {
    const container = await getTestContainer(new CoreModule());

    const actorService = await container.create(ScriptActorService, {
      config: {},
    });
    await actorService.start();

    return expect(actorService.last()).to.eventually.be.rejectedWith(NotImplementedError);
  });

  it('should inform scripts of the current step', async () => {
    const container = await getTestContainer(new CoreModule());

    const script = await container.create<ScriptService, BaseOptions>(INJECT_SCRIPT);
    const invokeStub = stub(script, 'invoke');

    const actorService = await container.create(ScriptActorService, {
      config: {},
    });
    await actorService.start();

    const step = { time: 100, turn: 100 };
    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    events.emit(EVENT_STATE_STEP, {
      step,
    });

    const actor = makeTestActor('', '', '');
    await actorService.onRoom({
      actor,
      room: makeTestRoom('', '', ''),
    });

    expect(invokeStub).to.have.been.calledWithMatch(actor, match.string, {
      step,
    });
  });

  it('should ignore room events for player actors', async () => {
    const container = await getTestContainer(new CoreModule());

    const actorService = await container.create(ScriptActorService, {
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

    return expect(container.create(ScriptActorService, {
      config: {
        attack: 'test',
        wander: undefined,
      },
    })).to.eventually.be.rejectedWith(ConfigError);
  });

  xit('should allow scripts to search the current room');
});
