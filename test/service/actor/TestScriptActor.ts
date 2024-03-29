import { mustExist, NotImplementedError } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { BaseOptions } from 'noicejs';

import { ConfigError } from '../../../src/error/ConfigError.js';
import { ActorSource } from '../../../src/model/entity/Actor.js';
import { INJECT_EVENT, INJECT_SCRIPT } from '../../../src/module/index.js';
import { CoreModule } from '../../../src/module/CoreModule.js';
import { ActorCommandEvent } from '../../../src/service/actor/events.js';
import { ScriptActorService } from '../../../src/service/actor/ScriptActor.js';
import { EventBus } from '../../../src/service/event/index.js';
import { ScriptContext, ScriptService } from '../../../src/service/script/index.js';
import { LocalScriptService, ScriptPairs } from '../../../src/service/script/LocalScript.js';
import { ShowVolume } from '../../../src/util/actor/index.js';
import { onceEvent } from '../../../src/util/async/event.js';
import {
  EVENT_ACTOR_COMMAND,
  EVENT_STATE_OUTPUT,
  EVENT_STATE_ROOM,
  EVENT_STATE_STEP,
  SIGNAL_BEHAVIOR,
  VERB_WAIT,
} from '../../../src/util/constants.js';
import { makeTestActor, makeTestRoom } from '../../entity.js';
import { getTestContainer, match, spy, stub } from '../../helper.js';

describe('script actor', () => {
  it('should invoke the behavior signal on room events', async () => {
    const container = await getTestContainer(new CoreModule());

    const actorService = await container.create(ScriptActorService, {
      config: {
        data: new Map(),
      },
    });
    await actorService.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const pending = onceEvent<ActorCommandEvent>(events, EVENT_ACTOR_COMMAND);

    const actor = makeTestActor('', '', '');
    actor.scripts.set(SIGNAL_BEHAVIOR, {
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
      config: {
        data: new Map(),
      },
    });
    await actorService.start();
    await actorService.stop();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    expect(events.listenerCount(EVENT_STATE_ROOM)).to.equal(0);
  });

  it('should not implement the last command method', async () => {
    const container = await getTestContainer(new CoreModule());

    const actorService = await container.create(ScriptActorService, {
      config: {
        data: new Map(),
      },
    });
    await actorService.start();

    return expect(actorService.last()).to.eventually.be.rejectedWith(NotImplementedError);
  });

  it('should inform scripts of the current step', async () => {
    const container = await getTestContainer(new CoreModule());

    const script = await container.create<ScriptService, BaseOptions>(INJECT_SCRIPT);
    const invokeStub = stub(script, 'invoke');

    const actorService = await container.create(ScriptActorService, {
      config: {
        data: new Map(),
      },
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
        data: new Map(),
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
        data: new Map([
          ['attack', 'test'],
          ['wander', undefined],
        ]),
      },
    })).to.eventually.be.rejectedWith(ConfigError);
  });

  it('should inform scripts of buffered output', async () => {
    const container = await getTestContainer(new CoreModule());

    const actor = makeTestActor('actor-foo', '', '');
    actor.scripts.set(SIGNAL_BEHAVIOR, {
      data: new Map(),
      name: 'output-length',
    });
    const otherActor = makeTestActor('actor-bar', '', '');

    const room = makeTestRoom('room-foo', '', '');
    const otherRoom = makeTestRoom('room-bar', '', '');

    const lengthSpy = spy();
    const testScripts: ScriptPairs = [
      ['output-length', async (context: ScriptContext) => {
        const output = await context.behavior.output({ actor, room });
        lengthSpy(output.length);
      }],
    ];

    const script = await container.create(LocalScriptService, {}, testScripts);
    const actorService = await container.create(ScriptActorService, {
      [INJECT_SCRIPT]: script,
      config: {
        data: new Map(),
      },
    });
    await actorService.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const length = 20;
    const step = { time: 100, turn: 100 };

    for (let i = 0; i < length; ++i) {
      events.emit(EVENT_STATE_OUTPUT, {
        line: 'foo',
        source: {
          room,
        },
        step,
        volume: ShowVolume.ROOM,
      });
    }

    for (let i = 0; i < length; ++i) {
      events.emit(EVENT_STATE_OUTPUT, {
        line: 'foo',
        source: {
          actor,
          room,
        },
        step,
        volume: ShowVolume.ROOM,
      });
    }

    for (let i = 0; i < length; ++i) {
      events.emit(EVENT_STATE_OUTPUT, {
        line: 'foo',
        source: {
          actor: otherActor,
          room,
        },
        step,
        volume: ShowVolume.ROOM,
      });
    }

    for (let i = 0; i < length; ++i) {
      events.emit(EVENT_STATE_OUTPUT, {
        line: 'foo',
        source: {
          room: otherRoom,
        },
        step,
        volume: ShowVolume.ROOM,
      });
    }

    for (let i = 0; i < length; ++i) {
      events.emit(EVENT_STATE_OUTPUT, {
        line: 'foo',
        step,
        volume: ShowVolume.ROOM,
      });
    }

    await actorService.onRoom({
      actor,
      room,
    });

    expect(lengthSpy).to.have.been.calledWith(length * 2); // length for room + length for room w/ actor
  });

  it('should inform scripts of buffered commands', async () => {
    const container = await getTestContainer(new CoreModule());

    const actor = makeTestActor('foo', '', '');
    actor.scripts.set(SIGNAL_BEHAVIOR, {
      data: new Map(),
      name: 'command-length',
    });

    const depthSpy = spy();
    const readySpy = spy();
    const testScripts: ScriptPairs = [
      ['command-length', async (context: ScriptContext) => {
        depthSpy(await context.behavior.depth(actor));
        readySpy(await context.behavior.ready(actor));
      }],
    ];

    const script = await container.create(LocalScriptService, {}, testScripts);
    const actorService = await container.create(ScriptActorService, {
      [INJECT_SCRIPT]: script,
      config: {
        data: new Map(),
      },
    });
    await actorService.start();

    await actorService.onRoom({
      actor,
      room: makeTestRoom('', '', ''),
    });

    expect(depthSpy).to.have.been.calledWith(0);
    expect(readySpy).to.have.been.calledWith(false);
  });

  xit('should allow scripts to search the current room');
});
