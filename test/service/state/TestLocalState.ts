/* eslint-disable max-lines */
import { InvalidArgumentError, mustExist } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { BaseOptions } from 'noicejs';
import { createStubInstance, match, spy, stub } from 'sinon';

import { NotInitializedError } from '../../../src/error/NotInitializedError.js';
import { ScriptTargetError } from '../../../src/error/ScriptTargetError.js';
import { makeCommand, makeCommandIndex } from '../../../src/model/Command.js';
import { Actor, ACTOR_TYPE, ActorSource, isActor } from '../../../src/model/entity/Actor.js';
import { Item, ITEM_TYPE } from '../../../src/model/entity/Item.js';
import { Portal, PORTAL_TYPE } from '../../../src/model/entity/Portal.js';
import { Room, ROOM_TYPE } from '../../../src/model/entity/Room.js';
import { Template } from '../../../src/model/mapped/Template.js';
import { WorldTemplate } from '../../../src/model/world/Template.js';
import { INJECT_COUNTER, INJECT_EVENT, INJECT_SCRIPT } from '../../../src/module/index.js';
import { CoreModule } from '../../../src/module/CoreModule.js';
import { Counter } from '../../../src/service/counter/index.js';
import { EventBus } from '../../../src/service/event/index.js';
import { LoaderSaveEvent } from '../../../src/service/loader/events.js';
import { ScriptService } from '../../../src/service/script/index.js';
import { LocalScriptService } from '../../../src/service/script/LocalScript.js';
import {
  StateJoinEvent,
  StateLoadEvent,
  StateOutputEvent,
  StateRoomEvent,
  StateStepEvent,
  StateWorldEvent,
} from '../../../src/service/state/events.js';
import { LocalStateService } from '../../../src/service/state/LocalState.js';
import { ShowVolume } from '../../../src/util/actor/index.js';
import { onceEvent } from '../../../src/util/async/event.js';
import {
  EVENT_ACTOR_JOIN,
  EVENT_LOADER_DONE,
  EVENT_LOADER_READ,
  EVENT_LOADER_SAVE,
  EVENT_LOADER_STATE,
  EVENT_LOADER_WORLD,
  EVENT_STATE_JOIN,
  EVENT_STATE_LOAD,
  EVENT_STATE_OUTPUT,
  EVENT_STATE_ROOM,
  EVENT_STATE_STEP,
  EVENT_STATE_WORLD,
  META_CREATE,
  META_DEBUG,
  META_GRAPH,
  META_HELP,
  META_LOAD,
  META_QUIT,
  META_SAVE,
  META_VERBS,
  META_WORLDS,
  SIGNAL_STEP,
  TEMPLATE_CHANCE,
  VERB_WAIT,
} from '../../../src/util/constants.js';
import { StateEntityGenerator } from '../../../src/util/entity/EntityGenerator.js';
import { makeTestActor, makeTestItem, makeTestPortal, makeTestRoom, makeTestState } from '../../entity.js';
import { createTestContext, getTestContainer } from '../../helper.js';

// #region fixtures
const TEST_ACTOR: Template<Actor> = {
  base: {
    flags: new Map(),
    items: [],
    meta: {
      id: 'bar',
      name: {
        base: 'test',
        type: 'string',
      },
      desc: {
        base: '',
        type: 'string',
      },
    },
    scripts: new Map([
      ['verbs.world.bar', {
        data: new Map(),
        name: {
          base: 'bar',
          type: 'string'
        },
      }]
    ]),
    slots: new Map(),
    source: {
      base: ActorSource.BEHAVIOR,
      type: 'string',
    },
    stats: new Map(),
    type: {
      base: ACTOR_TYPE,
      type: 'string',
    },
  },
  mods: [],
};

const TEST_ITEM: Template<Item> = {
  base: {
    flags: new Map(),
    meta: {
      id: 'bin',
      name: {
        base: '',
        type: 'string',
      },
      desc: {
        base: '',
        type: 'string',
      },
    },
    scripts: new Map(),
    slot: {
      base: '',
      type: 'string',
    },
    stats: new Map(),
    type: {
      base: ITEM_TYPE,
      type: 'string',
    },
  },
  mods: [],
};

const TEST_PORTAL: Template<Portal> = {
  base: {
    dest: {
      base: 'room-foo',
      type: 'string',
    },
    flags: new Map(),
    group: {
      key: {
        base: 'door',
        type: 'string',
      },
      source: {
        base: 'west',
        type: 'string',
      },
      target: {
        base: 'east',
        type: 'string',
      },
    },
    link: {
      base: 'both',
      type: 'string',
    },
    meta: {
      desc: {
        base: '',
        type: 'string',
      },
      id: 'portal-door',
      name: {
        base: 'door',
        type: 'string',
      },
    },
    stats: new Map(),
    scripts: new Map(),
    type: {
      base: PORTAL_TYPE,
      type: 'string',
    },
  },
  mods: [],
};

const TEST_ROOM: Template<Room> = {
  base: {
    actors: [],
    flags: new Map(),
    items: [],
    meta: {
      id: 'room-foo',
      name: {
        base: 'test',
        type: 'string',
      },
      desc: {
        base: '',
        type: 'string',
      },
    },
    portals: [],
    scripts: new Map([
      ['verbs.world.foo', {
        data: new Map(),
        name: {
          base: 'foo',
          type: 'string'
        },
      }]
    ]),
    type: {
      base: ROOM_TYPE,
      type: 'string',
    },
  },
  mods: [],
};

const TEST_WORLD: WorldTemplate = {
  defaults: {
    actor: TEST_ACTOR.base,
    item: TEST_ITEM.base,
    portal: TEST_PORTAL.base,
    room: TEST_ROOM.base,
  },
  locale: {
    languages: {},
  },
  meta: {
    id: 'foo',
    name: { base: 'foo', type: 'string' },
    desc: { base: 'foo', type: 'string' },
  },
  start: {
    actors: [{
      chance: TEMPLATE_CHANCE,
      id: TEST_ACTOR.base.meta.id,
      type: 'id',
    }],
    rooms: [{
      chance: TEMPLATE_CHANCE,
      id: TEST_ROOM.base.meta.id,
      type: 'id',
    }],
  },
  templates: {
    actors: [TEST_ACTOR],
    items: [TEST_ITEM],
    portals: [TEST_PORTAL],
    rooms: [TEST_ROOM],
  },
};
// #endregion fixtures

describe('local state service', () => {
  describe('player join event', () => {
    it('should create an actor when a player first joins', async () => {
      const container = await getTestContainer(new CoreModule());
      const localState = await container.create(LocalStateService);
      await localState.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      const command = makeCommandIndex(META_CREATE, 1, TEST_WORLD.meta.id);
      await localState.doCreate({
        command,
      });

      const actors = await localState.stepFind({
        type: ACTOR_TYPE,
      });
      expect(actors).to.have.lengthOf(0);

      const pendingJoin = onceEvent<StateJoinEvent>(events, EVENT_STATE_JOIN);
      const pendingRoom = onceEvent<StateRoomEvent>(events, EVENT_STATE_ROOM);

      const pid = 'player-0';
      events.emit(EVENT_ACTOR_JOIN, {
        pid,
      });

      const join = await pendingJoin;
      expect(join.pid).to.equal(pid);
      expect(join.actor.meta.id).to.equal(pid);

      const players = await localState.stepFind({
        meta: {
          id: pid,
        },
        type: ACTOR_TYPE,
      });
      expect(players).to.have.lengthOf(1);

      const room = await pendingRoom;
      expect(room.actor).to.equal(join.actor);
      expect(room.room).to.equal(join.room);
    });

    it('should use an existing actor when a player rejoins', async () => {
      const container = await getTestContainer(new CoreModule());
      const localState = await container.create(LocalStateService);
      await localState.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      const command = makeCommandIndex(META_CREATE, 1, TEST_WORLD.meta.id);
      await localState.doCreate({
        command,
      });

      const actors = await localState.stepFind({
        type: ACTOR_TYPE,
      });
      expect(actors).to.have.lengthOf(0);

      const pid = 'player-0';
      for (let i = 0; i < 3; i += 1) {
        const pendingJoin = onceEvent<StateJoinEvent>(events, EVENT_STATE_JOIN);

        events.emit(EVENT_ACTOR_JOIN, {
          pid,
        });

        await pendingJoin;
      }

      const players = await localState.stepFind({
        meta: {
          id: pid,
        },
        type: ACTOR_TYPE,
      });
      expect(players).to.have.lengthOf(1); // still just 1
    });

    xit('should handle world templates without starting actors');
    xit('should handle world templates with invalid starting actors');
  });

  describe('world load event', () => {
    it('should register world templates when they load', async () => {
      const container = await getTestContainer(new CoreModule());
      const localState = await container.create(LocalStateService);
      await localState.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      const pendingWorlds = onceEvent<StateWorldEvent>(events, EVENT_STATE_WORLD);

      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      const worlds = await pendingWorlds;

      expect(worlds.worlds).to.have.lengthOf(1);
    });
  });

  describe('create command', () => {
    xit('should handle world templates without any rooms');
    xit('should handle world templates without starting rooms');

    it('should create new worlds from the requested template', async () => {
      const container = await getTestContainer(new CoreModule());
      const localState = await container.create(LocalStateService);
      await localState.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      await localState.onCommand({
        command: makeCommandIndex(META_CREATE, 1, TEST_WORLD.meta.id),
      });

      const rooms = await localState.stepFind({
        type: ROOM_TYPE,
      });

      expect(rooms, 'number of rooms').to.have.lengthOf(1);
    });
  });

  describe('debug command', () => {
    it('should print debug with state', async () => {
      const container = await getTestContainer(new CoreModule());
      const localState = await container.create(LocalStateService);
      await localState.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      const command = makeCommandIndex(META_CREATE, 1, TEST_WORLD.meta.id);
      await localState.doCreate({
        command,
      });

      const pending = onceEvent<StateOutputEvent>(events, EVENT_STATE_OUTPUT);
      await localState.onCommand({
        command: makeCommand(META_DEBUG),
      });

      const output = await pending;
      expect(output.line).to.equal('state: foo-0');
    });

    it('should print an error without state', async () => {
      const container = await getTestContainer(new CoreModule());
      const localState = await container.create(LocalStateService);
      await localState.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      const pending = onceEvent<StateOutputEvent>(events, EVENT_STATE_OUTPUT);
      await localState.onCommand({
        command: makeCommand(META_DEBUG),
      });
      const output = await pending;

      expect(output.line).to.equal('meta.debug.missing');
    });
  });

  describe('graph command', () => {
    it('should print graph with state', async () => {
      const container = await getTestContainer(new CoreModule());
      const localState = await container.create(LocalStateService);
      await localState.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      const command = makeCommandIndex(META_CREATE, 1, TEST_WORLD.meta.id);
      await localState.doCreate({
        command,
      });

      const path = 'test://url';
      const pendingSave = onceEvent<LoaderSaveEvent>(events, EVENT_LOADER_SAVE);
      const pendingCommand = localState.onCommand({
        command: makeCommand(META_GRAPH, path),
      });

      events.emit(EVENT_LOADER_DONE, {
        path,
      });

      await pendingCommand;

      const output = await pendingSave;

      expect(output.data).to.include('strict digraph');
      expect(output.path).to.equal(path);
    });

    it('should print an error without state', async () => {
      const container = await getTestContainer(new CoreModule());
      const localState = await container.create(LocalStateService);
      await localState.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      const pending = onceEvent<StateOutputEvent>(events, EVENT_STATE_OUTPUT);
      await localState.onCommand({
        command: makeCommand(META_GRAPH, 'test://url'),
      });

      const output = await pending;
      expect(output.line).to.equal('meta.graph.missing');
    });
  });

  describe('help command', () => {
    it('should print meta commands for help without state', async () => {
      const container = await getTestContainer(new CoreModule());
      const localState = await container.create(LocalStateService);
      await localState.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      const pending = onceEvent<StateOutputEvent>(events, EVENT_STATE_OUTPUT);
      await localState.onCommand({
        command: makeCommand(META_HELP),
      });

      const output = await pending;
      expect(output.line).to.equal('meta.help');

      const context = mustExist(output.context);
      for (const verb of META_VERBS) {
        expect(context.verbs, `context verb: ${verb}`).to.include(verb);
      }
    });

    it('should print room commands for help with state', async () => {
      const container = await getTestContainer(new CoreModule());
      const localState = await container.create(LocalStateService);
      await localState.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      const generator = await container.create(StateEntityGenerator);
      generator.setWorld(TEST_WORLD);

      const actor = await generator.createActor(TEST_ACTOR);
      const room = await generator.createRoom(TEST_ROOM);

      const command = makeCommandIndex(META_CREATE, 1, TEST_WORLD.meta.id);
      await localState.doCreate({
        command,
      });

      const pending = onceEvent<StateOutputEvent>(events, EVENT_STATE_OUTPUT);
      await localState.onCommand({
        actor,
        command: makeCommand(META_HELP),
        room,
      });

      const output = await pending;
      expect(output.line).to.equal('meta.help');

      const context = mustExist(output.context);
      expect(context.verbs, 'room verb foo').to.include('verbs.world.foo');
      expect(context.verbs, 'room verb bar').to.include('verbs.world.bar');
    });
  });

  describe('load command', () => {
    it('should load state from path', async () => {
      const container = await getTestContainer(new CoreModule());
      const localState = await container.create(LocalStateService);
      await localState.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      const state = makeTestState('', []);
      state.meta.template = TEST_WORLD.meta.id;

      // respond to reads with state
      events.on(EVENT_LOADER_READ, (event) => {
        events.emit(EVENT_LOADER_STATE, {
          state,
        });
      });

      const pendingOutput = onceEvent<StateOutputEvent>(events, EVENT_STATE_OUTPUT);
      const pendingLoad = onceEvent<StateLoadEvent>(events, EVENT_STATE_LOAD);
      await localState.onCommand({
        command: makeCommandIndex(META_LOAD, 1, 'test://url'),
      });

      await expect(pendingOutput).to.eventually.deep.include({
        line: 'meta.load.state',
      });
      await expect(pendingLoad).to.eventually.deep.equal({
        state: state.meta.name,
        world: TEST_WORLD.meta.id,
      });
    });

    it('should load templates from path', async () => {
      const container = await getTestContainer(new CoreModule());
      const localState = await container.create(LocalStateService);
      await localState.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.on(EVENT_LOADER_READ, (event) => {
        events.emit(EVENT_LOADER_DONE, {
          path: event.path,
        });
      });

      const loadStub = stub();
      events.on(EVENT_STATE_LOAD, (event) => {
        loadStub(event);
      });

      const pendingOutput = onceEvent<StateOutputEvent>(events, EVENT_STATE_OUTPUT);
      await localState.onCommand({
        command: makeCommandIndex(META_LOAD, 1, 'test://url'),
      });

      const output = await pendingOutput;
      expect(output.line).to.equal('meta.load.missing');
      expect(loadStub).to.have.callCount(0);
    });
  });

  describe('quit command', () => {
    it('should emit quit event and resolve stop', async () => {
      const container = await getTestContainer(new CoreModule());
      const localState = await container.create(LocalStateService);
      await localState.start();

      const pending = localState.stop();
      await localState.onCommand({
        command: makeCommand(META_QUIT),
      });

      return expect(pending).to.eventually.equal(undefined);
    });
  });

  describe('save command', () => {
    it('should save state to path', async () => {
      const container = await getTestContainer(new CoreModule());
      const localState = await container.create(LocalStateService);
      await localState.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      // generate a world
      await localState.onCommand({
        command: makeCommandIndex(META_CREATE, 1, TEST_WORLD.meta.id),
      });

      // respond to reads with state
      const saveStub = stub();
      events.on(EVENT_LOADER_SAVE, (event) => {
        saveStub(event);
        events.emit(EVENT_LOADER_DONE, {
          path: event.path,
        });
      });

      const pendingOutput = onceEvent<StateOutputEvent>(events, EVENT_STATE_OUTPUT);
      await localState.onCommand({
        command: makeCommandIndex(META_SAVE, 1, 'test://url'),
      });

      await expect(pendingOutput).to.eventually.deep.include({
        line: 'meta.save.state',
      });
    });

    it('should print an error without state', async () => {
      const container = await getTestContainer(new CoreModule());
      const localState = await container.create(LocalStateService);
      await localState.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      // respond to reads with state
      const saveStub = stub();
      events.on(EVENT_LOADER_SAVE, (event) => {
        saveStub(event);
        events.emit(EVENT_LOADER_DONE, {
          path: event.path,
        });
      });

      const pendingOutput = onceEvent<StateOutputEvent>(events, EVENT_STATE_OUTPUT);
      await localState.onCommand({
        command: makeCommandIndex(META_SAVE, 1, 'test://url'),
      });

      await expect(pendingOutput).to.eventually.deep.include({
        line: 'meta.save.missing',
      });
    });
  });

  describe('worlds command', () => {
    it('should print loaded worlds', async () => {
      const container = await getTestContainer(new CoreModule());
      const localState = await container.create(LocalStateService);
      await localState.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      const pending = onceEvent<StateOutputEvent>(events, EVENT_STATE_OUTPUT);
      await localState.onCommand({
        command: makeCommand(META_WORLDS),
      });

      const output = await pending;
      expect(output.line).to.equal('meta.world');
    });
  });

  // any non-meta commands
  describe('step commands', () => {
    it('should error without actor', async () => {
      const module = new CoreModule();
      const container = await getTestContainer(module);

      const state = await container.create(LocalStateService);
      await state.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      const command = makeCommandIndex(META_CREATE, 1, TEST_WORLD.meta.id);
      await state.doCreate({
        command,
      });

      const pending = onceEvent<StateOutputEvent>(events, EVENT_STATE_OUTPUT);
      await state.onCommand({
        command: makeCommand(VERB_WAIT),
      });

      const output = await pending;
      expect(output.line).to.equal('meta.step.missing');
    });

    it('should error without state', async () => {
      const module = new CoreModule();
      const container = await getTestContainer(module);

      const state = await container.create(LocalStateService);
      await state.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      const pending = onceEvent<StateOutputEvent>(events, EVENT_STATE_OUTPUT);
      await state.onCommand({
        actor: makeTestActor('', '', ''),
        command: makeCommand(VERB_WAIT),
      });

      const output = await pending;
      expect(output.line).to.equal('meta.step.missing');
    });

    xit('should step after all actors have submitted a command');
  });

  describe('state step', () => {
    it('should invoke step script on each entity in state', async () => {
      const module = new CoreModule();
      const container = await getTestContainer(module);

      const state = await container.create(LocalStateService);
      await state.start();

      const world: WorldTemplate = {
        ...TEST_WORLD,
        templates: {
          actors: [{
            base: {
              ...TEST_ACTOR.base,
              items: [{
                chance: TEMPLATE_CHANCE,
                id: TEST_ITEM.base.meta.id,
                type: 'id',
              }],
            },
            mods: [],
          }],
          items: TEST_WORLD.templates.items,
          portals: TEST_WORLD.templates.portals,
          rooms: [{
            base: {
              ...TEST_ROOM.base,
              actors: [{
                chance: TEMPLATE_CHANCE,
                id: TEST_ACTOR.base.meta.id,
                type: 'id',
              }],
              items: [{
                chance: TEMPLATE_CHANCE,
                id: TEST_ITEM.base.meta.id,
                type: 'id',
              }],
              portals: [{
                chance: TEMPLATE_CHANCE,
                id: TEST_PORTAL.base.meta.id,
                type: 'id',
              }],
            },
            mods: TEST_ROOM.mods,
          }],
        }
      };
      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, { world });

      const pendingLoad = onceEvent<StateLoadEvent>(events, EVENT_STATE_LOAD);

      const command = makeCommand(META_CREATE, TEST_WORLD.meta.id);
      await state.doCreate({
        command,
      });

      await pendingLoad;

      const script = await container.create<LocalScriptService, BaseOptions>(INJECT_SCRIPT);
      const invokeStub = stub(script, 'invoke');

      const pendingStep = onceEvent<StateStepEvent>(events, EVENT_STATE_STEP);

      const rooms = await state.stepFind({
        type: ROOM_TYPE,
      });

      let broadcast = true;
      for (const room of rooms) {
        for (const actor of room.actors) {
          if (broadcast) {
            broadcast = false;
            await state.stepEnter({ room, actor });
          }

          await state.onCommand({
            actor,
            command: makeCommand(VERB_WAIT),
          });
        }
      }

      await pendingStep;

      expect(invokeStub).to.have.callCount(5); // one room, one actor, one item in each, one portal
      expect(invokeStub).to.have.been.calledWithMatch(
        match.object.and(match.has('type', match.string)),
        SIGNAL_STEP,
        match.object
      );
    });

    it('should error without state', async () => {
      const module = new CoreModule();
      const container = await getTestContainer(module);

      const state = await container.create(LocalStateService);
      await state.start();

      return expect(state.step()).to.eventually.be.rejectedWith(NotInitializedError);
    });

    it('should only step each entity ID once', async () => {
      const module = new CoreModule();
      const container = await getTestContainer(module);

      const counter = await container.create<Counter, BaseOptions>(INJECT_COUNTER);
      stub(counter, 'next').returns(0);

      const generator = createStubInstance(StateEntityGenerator);
      generator.createState.resolves(makeTestState('', [
        makeTestRoom('room-0', '', '', [
          makeTestActor('actor-0', '', '', makeTestItem('item-0', '', '')),
        ], [
          makeTestItem('item-1', '', ''),
        ], [
          makeTestPortal('portal-0', '', '', '', ''),
        ]),
        makeTestRoom('room-0', '', ''),
        makeTestRoom('room-1', '', '', [
          // TODO: this makes step throw internally because it is currently difficult to queue two commands for the same actor
          // makeTestActor('actor-0', '', ''),
          makeTestActor('actor-1', '', '', makeTestItem('item-0', '', '')),
        ], [
          makeTestItem('item-1', '', ''),
        ], [
          makeTestPortal('portal-0', '', '', '', ''),
        ]),
      ]));
      module.bind(StateEntityGenerator).toInstance(generator as any);

      const state = await container.create(LocalStateService);
      await state.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      await state.doCreate({
        command: makeCommand(META_CREATE, 'foo', '4'),
      });

      const script = await container.create<ScriptService, BaseOptions>(INJECT_SCRIPT);
      const scriptSpy = spy(script, 'invoke');

      const rooms = await state.stepFind({
        type: ROOM_TYPE,
      });

      let broadcast = true;
      for (const room of rooms) {
        for (const actor of room.actors) {
          if (broadcast) {
            broadcast = false;
            await state.stepEnter({ room, actor });
          }

          await state.onCommand({
            actor,
            command: makeCommand(VERB_WAIT),
          });
        }
      }

      expect(scriptSpy).to.have.callCount(7); // 2 rooms, 2 actors, 2 items, 1 portal
    });

    it('should error when some actors are missing commands', async () => {
      const module = new CoreModule();
      const container = await getTestContainer(module);

      const counter = await container.create<Counter, BaseOptions>(INJECT_COUNTER);
      stub(counter, 'next').returns(0);

      const generator = createStubInstance(StateEntityGenerator);
      generator.createState.resolves(makeTestState('', [
        makeTestRoom('room-0', '', '', [
          makeTestActor('actor-0', '', ''),
        ]),
        makeTestRoom('room-0', '', '', [
          makeTestActor('actor-0', '', ''),
        ]),
      ]));
      module.bind(StateEntityGenerator).toInstance(generator as any);

      const state = await container.create(LocalStateService);
      await state.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      await state.doCreate({
        command: makeCommand(META_CREATE, 'foo', '4'),
      });

      return expect(state.step()).to.eventually.be.rejectedWith(Error);
    });

    it('should provide script access to the command buffer', async () => {
      const module = new CoreModule();
      const container = await getTestContainer(module);

      const state = await container.create(LocalStateService);
      const showSpy = spy(state, 'stepShow');
      await state.start();

      const world: WorldTemplate = {
        ...TEST_WORLD,
        templates: {
          actors: [{
            base: {
              ...TEST_ACTOR.base,
              items: [{
                chance: TEMPLATE_CHANCE,
                id: TEST_ITEM.base.meta.id,
                type: 'id',
              }],
            },
            mods: [],
          }],
          items: TEST_WORLD.templates.items,
          portals: TEST_WORLD.templates.portals,
          rooms: [{
            base: {
              ...TEST_ROOM.base,
              actors: [{
                chance: TEMPLATE_CHANCE,
                id: TEST_ACTOR.base.meta.id,
                type: 'id',
              }],
              items: [{
                chance: TEMPLATE_CHANCE,
                id: TEST_ITEM.base.meta.id,
                type: 'id',
              }],
              portals: [{
                chance: TEMPLATE_CHANCE,
                id: TEST_PORTAL.base.meta.id,
                type: 'id',
              }],
            },
            mods: TEST_ROOM.mods,
          }],
        }
      };
      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, { world });

      const pendingLoad = onceEvent<StateLoadEvent>(events, EVENT_STATE_LOAD);

      const command = makeCommand(META_CREATE, TEST_WORLD.meta.id);
      await state.doCreate({
        command,
      });

      await pendingLoad;

      const script = await container.create<LocalScriptService, BaseOptions>(INJECT_SCRIPT);
      const invokeStub = stub(script, 'invoke').callsFake(async (target, _slot, scope) => {
        if (isActor(target)) {
          await scope.behavior.queue(target, makeCommand(''));
          const depth = await scope.behavior.depth(target);
          await scope.state.show(scope.source, depth.toString(10));
          const ready = await scope.behavior.ready(target);
          await scope.state.show(scope.source, ready.toString());
        }
        return Promise.resolve();
      });

      const pendingStep = onceEvent<StateStepEvent>(events, EVENT_STATE_STEP);

      const rooms = await state.stepFind({
        type: ROOM_TYPE,
      });

      let broadcast = true;
      for (const room of rooms) {
        for (const actor of room.actors) {
          if (broadcast) {
            broadcast = false;
            await state.stepEnter({ room, actor });
          }

          await state.onCommand({
            actor,
            command: makeCommand(VERB_WAIT),
          });
        }
      }

      await pendingStep;

      expect(invokeStub).to.have.callCount(5);
      expect(showSpy).to.have.been.calledWithMatch(match.object, '1');
      expect(showSpy).to.have.been.calledWithMatch(match.object, 'true');
    });
  });

  describe('step create helper', () => {
    it('should create actors and add them to the target room', async () => {
      const module = new CoreModule();
      const container = await getTestContainer(module);

      const state = await container.create(LocalStateService);
      await state.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      await state.doCreate({
        command: makeCommand(META_CREATE, 'foo', '4'),
      });

      const [room] = await state.stepFind({
        type: ROOM_TYPE,
      });

      const actor = makeTestActor('', '', '');
      await state.stepCreate('bar', ACTOR_TYPE, {
        actor,
        room,
      });

      expect(room.actors).to.have.lengthOf(1);
    });

    it('should create items and add them to the target room', async () => {
      const module = new CoreModule();
      const container = await getTestContainer(module);

      const state = await container.create(LocalStateService);
      await state.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      await state.doCreate({
        command: makeCommand(META_CREATE, 'foo', '4'),
      });

      const actor = makeTestActor('', '', '');
      const room = makeTestRoom('', '', '', [actor]);

      await state.stepCreate('bin', ITEM_TYPE, {
        room,
      });

      expect(actor.items, 'actor items').to.have.lengthOf(0);
      expect(room.items, 'room items').to.have.lengthOf(1);
    });

    it('should create items and add them to the target actor', async () => {
      const module = new CoreModule();
      const container = await getTestContainer(module);

      const state = await container.create(LocalStateService);
      await state.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      await state.doCreate({
        command: makeCommand(META_CREATE, 'foo', '4'),
      });

      const actor = makeTestActor('', '', '');
      const room = makeTestRoom('', '', '', [actor]);

      await state.stepCreate('bin', ITEM_TYPE, {
        actor,
        room,
      });

      expect(actor.items, 'actor items').to.have.lengthOf(1);
      expect(room.items, 'room items').to.have.lengthOf(0);
    });

    it('should only create actors and items', async () => {
      const module = new CoreModule();
      const container = await getTestContainer(module);

      const state = await container.create(LocalStateService);
      await state.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      await state.doCreate({
        command: makeCommand(META_CREATE, 'foo', '4'),
      });

      const actor = makeTestActor('', '', '');
      const room = makeTestRoom('', '', '', [actor]);

      await expect(state.stepCreate('door', PORTAL_TYPE, {
        room,
      })).to.eventually.be.rejectedWith(InvalidArgumentError);

      await expect(state.stepCreate('foo', ROOM_TYPE, {
        room,
      })).to.eventually.be.rejectedWith(InvalidArgumentError);
    });
  });

  describe('step enter helper', () => {
    xit('should populate portals with new rooms');
    xit('should notify the actor of their new room');
    xit('should add new rooms to world state');
  });

  describe('step find helper', () => {
    it('should search state', async () => {
      const module = new CoreModule();
      const container = await getTestContainer(module);

      const state = await container.create(LocalStateService);
      await state.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      const command = makeCommandIndex(META_CREATE, 1, TEST_WORLD.meta.id);
      await state.doCreate({
        command,
      });

      const results = await state.stepFind({
        type: ROOM_TYPE,
      });

      expect(results).to.have.lengthOf(1);
    });
  });

  describe('step move helper', () => {
    it('should move actors', async () => {
      const module = new CoreModule();
      const container = await getTestContainer(module);

      const state = await container.create(LocalStateService);
      await state.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      const command = makeCommandIndex(META_CREATE, 1, TEST_WORLD.meta.id);
      await state.doCreate({
        command,
      });

      const moving = makeTestActor('', '', '');
      const transfer = {
        moving,
        source: makeTestRoom('', '', '', [moving], []),
        target: makeTestRoom('', '', '', [], []),
      };
      await state.stepMove(transfer, createTestContext());

      expect(transfer.source.actors, 'source actors').to.have.lengthOf(0);
      expect(transfer.target.actors, 'target actors').to.have.lengthOf(1);
    });

    it('should move items', async () => {
      const module = new CoreModule();
      const container = await getTestContainer(module);

      const state = await container.create(LocalStateService);
      await state.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      const command = makeCommandIndex(META_CREATE, 1, TEST_WORLD.meta.id);
      await state.doCreate({
        command,
      });

      const moving = makeTestItem('', '', '');
      const transfer = {
        moving,
        source: makeTestRoom('', '', '', [], [moving]),
        target: makeTestRoom('', '', '', [], []),
      };
      await state.stepMove(transfer, createTestContext());

      expect(transfer.source.items, 'source items').to.have.lengthOf(0);
      expect(transfer.target.items, 'target items').to.have.lengthOf(1);
    });

    it('should error when moving rooms', async () => {
      const module = new CoreModule();
      const container = await getTestContainer(module);

      const state = await container.create(LocalStateService);
      await state.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      const command = makeCommandIndex(META_CREATE, 1, TEST_WORLD.meta.id);
      await state.doCreate({
        command,
      });

      const transfer = {
        moving: makeTestRoom('', '', '', [], []) as any,
        source: makeTestRoom('', '', '', [], []),
        target: makeTestRoom('', '', '', [], []),
      };

      return expect(state.stepMove(transfer, createTestContext())).to.eventually.be.rejectedWith(ScriptTargetError);
    });

    it('should move everything', async () => {
      const module = new CoreModule();
      const container = await getTestContainer(module);

      const state = await container.create(LocalStateService);
      await state.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      const command = makeCommandIndex(META_CREATE, 1, TEST_WORLD.meta.id);
      await state.doCreate({
        command,
      });

      const transfer = {
        moving: undefined,
        source: makeTestRoom('', '', '', [makeTestActor('', '', '')], [makeTestItem('', '', '')]),
        target: makeTestRoom('', '', '', [], []),
      };
      await state.stepMove(transfer, createTestContext());

      expect(transfer.source.actors, 'source actors').to.have.lengthOf(0);
      expect(transfer.target.actors, 'target actors').to.have.lengthOf(1);

      expect(transfer.source.items, 'source items').to.have.lengthOf(0);
      expect(transfer.target.items, 'target items').to.have.lengthOf(1);
    });
  });

  describe('step show helper', () => {
    it('should emit messages', async () => {
      const module = new CoreModule();
      const container = await getTestContainer(module);

      const state = await container.create(LocalStateService);
      await state.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      const command = makeCommandIndex(META_CREATE, 1, TEST_WORLD.meta.id);
      await state.doCreate({
        command,
      });

      const pending = onceEvent<StateOutputEvent>(events, EVENT_STATE_OUTPUT);

      const source = {
        room: makeTestRoom('', '', ''),
      };
      await state.stepShow(source, 'foo', {}, ShowVolume.SELF);

      const output = await pending;
      expect(output.line).to.equal('foo');
      expect(output.volume).to.equal(ShowVolume.SELF);
    });

    it('should default to self volume', async () => {
      const module = new CoreModule();
      const container = await getTestContainer(module);

      const state = await container.create(LocalStateService);
      await state.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      const command = makeCommandIndex(META_CREATE, 1, TEST_WORLD.meta.id);
      await state.doCreate({
        command,
      });

      const pending = onceEvent<StateOutputEvent>(events, EVENT_STATE_OUTPUT);

      const source = {
        room: makeTestRoom('', '', ''),
      };
      await state.stepShow(source, 'foo', {});

      const output = await pending;
      expect(output.volume).to.equal(ShowVolume.SELF);
    });
  });

  describe('step update helper', () => {
    it('should be a noop for local state', async () => {
      const module = new CoreModule();
      const container = await getTestContainer(module);

      const state = await container.create(LocalStateService);
      await state.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, {
        world: TEST_WORLD,
      });

      const entity = makeTestActor('', '', '');
      return expect(state.stepUpdate(entity, {})).to.eventually.equal(undefined);
    });
  });
});
