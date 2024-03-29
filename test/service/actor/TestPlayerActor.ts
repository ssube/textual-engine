import { expect } from 'chai';
import { BaseOptions } from 'noicejs';

import { makeCommand, makeCommandIndex } from '../../../src/model/Command.js';
import { INJECT_EVENT, INJECT_LOCALE } from '../../../src/module/index.js';
import { CoreModule } from '../../../src/module/CoreModule.js';
import { ActorCommandEvent, ActorJoinEvent, ActorOutputEvent } from '../../../src/service/actor/events.js';
import { PlayerActorService } from '../../../src/service/actor/PlayerActor.js';
import { EventBus } from '../../../src/service/event/index.js';
import { LocaleService } from '../../../src/service/locale/index.js';
import { ShowVolume } from '../../../src/util/actor/index.js';
import { onceEvent } from '../../../src/util/async/event.js';
import {
  EVENT_ACTOR_COMMAND,
  EVENT_ACTOR_JOIN,
  EVENT_ACTOR_OUTPUT,
  EVENT_ACTOR_QUIT,
  EVENT_ACTOR_ROOM,
  EVENT_STATE_JOIN,
  EVENT_STATE_LOAD,
  EVENT_STATE_OUTPUT,
  EVENT_STATE_QUIT,
  EVENT_STATE_ROOM,
  EVENT_TOKEN_COMMAND,
  STAT_HEALTH,
  STAT_SCORE,
  VERB_WAIT,
} from '../../../src/util/constants.js';
import { zeroStep } from '../../../src/util/entity/index.js';
import { makeTestActor, makeTestRoom } from '../../entity.js';
import { getTestContainer, stub } from '../../helper.js';

describe('player actor', () => {
  it('should parse render output into commands', async () => {
    const container = await getTestContainer(new CoreModule());

    const actor = await container.create(PlayerActorService);
    await actor.start();

    const event = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const pending = onceEvent<ActorCommandEvent>(event, EVENT_ACTOR_COMMAND);

    event.emit(EVENT_TOKEN_COMMAND, {
      command: makeCommandIndex('foo', 10, 'bar'),
    });

    const cmd = await pending;
    return expect(actor.last()).to.eventually.deep.equal(cmd.command);
  });

  it('should translate output and forward it to render', async () => {
    const container = await getTestContainer(new CoreModule());

    const locale = await container.create<LocaleService, BaseOptions>(INJECT_LOCALE);
    await locale.start();
    locale.addBundle('world', {
      languages: {
        en: {
          articles: [],
          prepositions: [],
          strings: {
            'meta.help': 'foo',
          },
          verbs: [],
        },
      },
    });

    const actor = await container.create(PlayerActorService);
    await actor.start();

    const event = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const pending = onceEvent<ActorOutputEvent>(event, EVENT_ACTOR_OUTPUT);

    event.emit(EVENT_STATE_OUTPUT, {
      line: 'meta.help',
      step: zeroStep(),
      volume: ShowVolume.SELF,
    });

    const output = await pending;
    expect(output.line).to.equal('foo');
  });

  it('should save the actor after joining and send it with output', async () => {
    const container = await getTestContainer(new CoreModule());

    const player = await container.create(PlayerActorService);
    await player.start();

    const event = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const pendingJoin = onceEvent<ActorJoinEvent>(event, EVENT_ACTOR_JOIN);
    event.emit(EVENT_STATE_LOAD, {
      state: '',
      world: '',
    });
    const { pid } = await pendingJoin;

    const actor = makeTestActor('', '', '');
    const room = makeTestRoom('', '', '', [], []);
    player.onJoin({
      actor,
      pid,
      room,
    });

    const pendingCommand = onceEvent<ActorCommandEvent>(event, EVENT_ACTOR_COMMAND);
    event.emit(EVENT_TOKEN_COMMAND, {
      command: makeCommand(VERB_WAIT),
    });

    const command = await pendingCommand;
    expect(command.actor).to.equal(actor);
    expect(command.room).to.equal(room);
  });

  it('should request to join worlds when they load', async () => {
    const container = await getTestContainer(new CoreModule());

    const player = await container.create(PlayerActorService);
    await player.start();

    const event = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const pendingJoin = onceEvent<ActorJoinEvent>(event, EVENT_ACTOR_JOIN);

    event.emit(EVENT_STATE_LOAD, {
      state: '',
      world: '',
    });

    return expect(pendingJoin).to.eventually.have.key('pid').and.satisfy((it: ActorJoinEvent) => it.pid.startsWith('player'));
  });

  it('should start without an actor or room', async () => {
    const container = await getTestContainer(new CoreModule());

    const player = await container.create(PlayerActorService);
    await player.start();

    const actor = makeTestActor('', '', '');
    const room = makeTestRoom('', '', '', [], []);
    player.onRoom({
      actor,
      room,
    });

    const event = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const pendingCommand = onceEvent<ActorCommandEvent>(event, EVENT_ACTOR_COMMAND);
    event.emit(EVENT_TOKEN_COMMAND, {
      command: makeCommand(VERB_WAIT),
    });

    const command = await pendingCommand;
    expect(command.actor, 'command actor').to.equal(undefined);
    expect(command.room, 'command room').to.equal(undefined);
  });

  it('should save the room after moving', async () => {
    const container = await getTestContainer(new CoreModule());

    const player = await container.create(PlayerActorService);
    await player.start();

    const event = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const pendingJoin = onceEvent<ActorJoinEvent>(event, EVENT_ACTOR_JOIN);
    event.emit(EVENT_STATE_LOAD, {
      state: '',
      world: '',
    });
    const { pid } = await pendingJoin;

    const actor = makeTestActor(pid, '', '');
    const sourceRoom = makeTestRoom('', '', '', [actor], []);
    const targetRoom = makeTestRoom('', '', '', [actor], []);

    player.onJoin({
      actor,
      pid,
      room: sourceRoom,
    });

    const pendingRoom = onceEvent(event, EVENT_ACTOR_ROOM);

    event.emit(EVENT_STATE_ROOM, {
      actor,
      room: targetRoom,
    });

    await pendingRoom;

    const pendingCommand = onceEvent<ActorCommandEvent>(event, EVENT_ACTOR_COMMAND);
    event.emit(EVENT_TOKEN_COMMAND, {
      command: makeCommand(VERB_WAIT),
    });

    const command = await pendingCommand;
    expect(command.actor, 'command actor').to.equal(actor);
    expect(command.room, 'command room').to.equal(targetRoom);
  });

  it('should filter join events by pid', async () => {
    const container = await getTestContainer(new CoreModule());

    const player = await container.create(PlayerActorService);
    await player.start();

    const event = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const actorRoomStub = stub();
    event.on(EVENT_ACTOR_ROOM, actorRoomStub);

    const pendingJoin = onceEvent<ActorJoinEvent>(event, EVENT_ACTOR_JOIN);
    event.emit(EVENT_STATE_LOAD, {
      state: '',
      world: '',
    });
    const { pid } = await pendingJoin;

    const actor = makeTestActor('', '', '');
    const room = makeTestRoom('', '', '', [], []);
    event.emit(EVENT_STATE_JOIN, {
      actor,
      pid: 'false',
      room,
    });

    event.emit(EVENT_STATE_JOIN, {
      actor,
      pid,
      room,
    });

    expect(actorRoomStub).to.have.callCount(1);
  });

  it('should test output volume when source is set', async () => {
    const container = await getTestContainer(new CoreModule());

    const locale = await container.create<LocaleService, BaseOptions>(INJECT_LOCALE);
    await locale.start();

    const player = await container.create(PlayerActorService);
    await player.start();

    const event = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const actorOutputStub = stub();
    event.on(EVENT_ACTOR_OUTPUT, actorOutputStub);

    const pendingJoin = onceEvent<ActorJoinEvent>(event, EVENT_ACTOR_JOIN);
    event.emit(EVENT_STATE_LOAD, {
      state: '',
      world: '',
    });
    const { pid } = await pendingJoin;

    const actor = makeTestActor(pid, '', '');
    const room = makeTestRoom('', '', '', [actor], []);
    event.emit(EVENT_STATE_JOIN, {
      actor,
      pid,
      room,
    });

    const line = 'foo';
    const step = zeroStep();

    // should be filtered out
    const other = makeTestActor('', '', '');
    event.emit(EVENT_STATE_OUTPUT, {
      line,
      source: {
        actor: other,
        room,
      },
      step,
      volume: ShowVolume.SELF,
    });

    // should be passed on
    event.emit(EVENT_STATE_OUTPUT, {
      line,
      source: {
        actor,
        room,
      },
      step,
      volume: ShowVolume.SELF,
    });

    expect(actorOutputStub).to.have.callCount(1).and.been.calledWith({
      line,
      step,
    });
  });

  it('should include values from the current actor values for quit stats', async () => {
    const container = await getTestContainer(new CoreModule());

    const locale = await container.create<LocaleService, BaseOptions>(INJECT_LOCALE);
    await locale.start();

    const player = await container.create(PlayerActorService);
    await player.start();

    const event = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const pendingJoin = onceEvent<ActorJoinEvent>(event, EVENT_ACTOR_JOIN);
    event.emit(EVENT_STATE_LOAD, {
      state: '',
      world: '',
    });
    const { pid } = await pendingJoin;

    const actor = makeTestActor(pid, '', '');
    actor.stats.set(STAT_HEALTH, 20);
    actor.stats.set(STAT_SCORE, 10);

    const room = makeTestRoom('', '', '', [actor], []);
    event.emit(EVENT_STATE_JOIN, {
      actor,
      pid,
      room,
    });

    const actorQuitStub = stub();
    event.on(EVENT_ACTOR_QUIT, actorQuitStub);

    event.emit(EVENT_STATE_QUIT, {
      line: 'foo',
      stats: [STAT_SCORE],
    });

    expect(actorQuitStub).to.have.been.calledWith({
      line: 'foo',
      stats: [{
        name: STAT_SCORE,
        value: 10,
      }],
    });
  });
});
