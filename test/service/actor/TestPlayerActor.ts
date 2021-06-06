import { expect } from 'chai';
import { BaseOptions } from 'noicejs';

import { INJECT_EVENT, INJECT_LOCALE } from '../../../src/module';
import { CoreModule } from '../../../src/module/CoreModule';
import { ActorCommandEvent, ActorJoinEvent, ActorOutputEvent } from '../../../src/service/actor/events';
import { PlayerActorService } from '../../../src/service/actor/PlayerActor';
import { EventBus } from '../../../src/service/event';
import { LocaleService } from '../../../src/service/locale';
import { ShowVolume } from '../../../src/util/actor';
import { onceEvent } from '../../../src/util/async/event';
import {
  EVENT_ACTOR_COMMAND,
  EVENT_ACTOR_JOIN,
  EVENT_ACTOR_OUTPUT,
  EVENT_RENDER_OUTPUT,
  EVENT_STATE_LOAD,
  EVENT_STATE_OUTPUT,
  VERB_WAIT,
} from '../../../src/util/constants';
import { makeTestActor, makeTestRoom } from '../../entity';
import { getTestContainer } from '../../helper';

describe('player actor', () => {
  it('should parse render output into commands', async () => {
    const container = await getTestContainer(new CoreModule());

    const locale = await container.create<LocaleService, BaseOptions>(INJECT_LOCALE);
    await locale.start();

    const actor = await container.create(PlayerActorService);
    await actor.start();

    const index = 13;
    const line = `foo bar ${index}`;

    const event = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const pending = onceEvent<ActorCommandEvent>(event, EVENT_ACTOR_COMMAND);

    event.emit(EVENT_RENDER_OUTPUT, {
      line,
    });

    const cmd = await pending;
    return expect(actor.last()).to.eventually.deep.equal(cmd.command);
  });

  it('should translate output and forward it to render', async () => {
    const container = await getTestContainer(new CoreModule());

    const locale = await container.create<LocaleService, BaseOptions>(INJECT_LOCALE);
    await locale.start();

    locale.addBundle('world', {
      bundles: {
        en: {
          'meta.help': 'foo',
        },
      },
      verbs: [],
    });

    const actor = await container.create(PlayerActorService);
    await actor.start();

    const event = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const pending = onceEvent<ActorOutputEvent>(event, EVENT_ACTOR_OUTPUT);

    event.emit(EVENT_STATE_OUTPUT, {
      line: 'meta.help',
      step: {
        time: 0,
        turn: 0,
      },
      volume: ShowVolume.SELF,
    });

    const output = await pending;
    expect(output.line).to.equal('foo');
  });

  it('should save the actor after joining and send it with output', async () => {
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

    const actor = makeTestActor('', '', '');
    const room = makeTestRoom('', '', '', [], []);
    player.onJoin({
      actor,
      pid,
      room,
    });

    const pendingCommand = onceEvent<ActorCommandEvent>(event, EVENT_ACTOR_COMMAND);
    event.emit(EVENT_RENDER_OUTPUT, {
      line: VERB_WAIT,
    });

    const command = await pendingCommand;
    expect(command.actor).to.equal(actor);
    expect(command.room).to.equal(room);
  });

  it('should request to join worlds when they load', async () => {
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

    return expect(pendingJoin).to.eventually.have.key('pid').and.satisfy((it: ActorJoinEvent) => it.pid.startsWith('player'));
  });

  it('should start without an actor or room', async () => {
    const container = await getTestContainer(new CoreModule());

    const locale = await container.create<LocaleService, BaseOptions>(INJECT_LOCALE);
    await locale.start();

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
    event.emit(EVENT_RENDER_OUTPUT, {
      line: VERB_WAIT,
    });

    const command = await pendingCommand;
    expect(command.actor, 'command actor').to.equal(undefined);
    expect(command.room, 'command room').to.equal(undefined);
  });

  it('should save the room after moving', async () => {
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
    const room = makeTestRoom('', '', '', [actor], []);
    player.onRoom({
      actor,
      room,
    });

    const pendingCommand = onceEvent<ActorCommandEvent>(event, EVENT_ACTOR_COMMAND);
    event.emit(EVENT_RENDER_OUTPUT, {
      line: VERB_WAIT,
    });

    const command = await pendingCommand;
    // this would normally be set on join, but this player never actually joined
    expect(command.actor, 'command actor').to.equal(undefined);
    expect(command.room, 'command room').to.equal(room);
  });

  xit('should test output volume when source is set');
  xit('should translate and cache verbs');
});
