/* eslint-disable max-lines */
import { mustExist } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { BaseOptions } from 'noicejs';
import { createStubInstance, match, stub } from 'sinon';

import { NotInitializedError } from '../../../src/error/NotInitializedError';
import { ScriptTargetError } from '../../../src/error/ScriptTargetError';
import { Actor, ACTOR_TYPE, ActorSource, isActor } from '../../../src/model/entity/Actor';
import { Item, ITEM_TYPE } from '../../../src/model/entity/Item';
import { Portal, PORTAL_TYPE } from '../../../src/model/entity/Portal';
import { Room, ROOM_TYPE } from '../../../src/model/entity/Room';
import { Template } from '../../../src/model/mapped/Template';
import { WorldTemplate } from '../../../src/model/world/Template';
import { INJECT_EVENT, INJECT_SCRIPT } from '../../../src/module';
import { CoreModule } from '../../../src/module/CoreModule';
import { EventBus } from '../../../src/service/event';
import { LoaderSaveEvent } from '../../../src/service/loader/events';
import { MathRandomGenerator } from '../../../src/service/random/MathRandom';
import { LocalScriptService } from '../../../src/service/script/LocalScript';
import { StateJoinEvent, StateLoadEvent, StateOutputEvent, StateRoomEvent, StateStepEvent } from '../../../src/service/state/events';
import { LocalStateService } from '../../../src/service/state/LocalState';
import { ShowVolume } from '../../../src/util/actor';
import { onceEvent } from '../../../src/util/async/event';
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
} from '../../../src/util/constants';
import { StateEntityGenerator } from '../../../src/util/state/EntityGenerator';
import { StateEntityTransfer } from '../../../src/util/state/EntityTransfer';
import { makeTestActor, makeTestItem, makeTestRoom, makeTestState } from '../../entity';
import { getStubHelper, getTestContainer, getTestLogger } from '../../helper';

// #region fixtures
const TEST_ACTOR: Template<Actor> = {
  base: {
    source: {
      base: ActorSource.BEHAVIOR,
      type: 'string',
    },
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
    stats: new Map(),
    scripts: new Map([
      ['verbs.world.bar', {
        data: new Map(),
        name: {
          base: 'bar',
          type: 'string'
        },
      }]
    ]),
    type: {
      base: ACTOR_TYPE,
      type: 'string',
    },
  },
  mods: [],
};

const TEST_ITEM: Template<Item> = {
  base: {
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
    groupKey: {
      base: 'door',
      type: 'string',
    },
    groupSource: {
      base: 'west',
      type: 'string',
    },
    groupTarget: {
      base: 'east',
      type: 'string',
    },
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
    items: [],
    meta: {
      id: 'foo',
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
    bundles: {},
    verbs: [],
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
    portals: [],
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

      await localState.doCreate(TEST_WORLD.meta.id, 1);

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

    xit('should use an existing actor when a player rejoins');
  });

  describe('world load event', () => {
    xit('should register world templates when they load');
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
        command: {
          index: 1,
          input: '',
          target: TEST_WORLD.meta.id,
          verb: META_CREATE,
        },
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

      await localState.doCreate(TEST_WORLD.meta.id, 1);
      const pending = onceEvent<StateOutputEvent>(events, EVENT_STATE_OUTPUT);
      await localState.onCommand({
        command: {
          index: 0,
          input: '',
          target: '',
          verb: META_DEBUG,
        },
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
        command: {
          index: 0,
          input: '',
          target: '',
          verb: META_DEBUG,
        },
      });
      const output = await pending;

      expect(output.line).to.equal('meta.debug.none');
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

      await localState.doCreate(TEST_WORLD.meta.id, 1);
      const pending = onceEvent<LoaderSaveEvent>(events, EVENT_LOADER_SAVE);
      await localState.onCommand({
        command: {
          index: 0,
          input: '',
          target: 'test://url',
          verb: META_GRAPH,
        },
      });

      const output = await pending;
      expect(output.data).to.include('strict digraph');
      expect(output.path).to.equal('test://url');
    });

    it('should print an error without state', async () => {
      const container = await getTestContainer(new CoreModule());
      const localState = await container.create(LocalStateService);
      await localState.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      const pending = onceEvent<StateOutputEvent>(events, EVENT_STATE_OUTPUT);
      await localState.onCommand({
        command: {
          index: 0,
          input: '',
          target: 'test://url',
          verb: META_GRAPH,
        },
      });

      const output = await pending;
      expect(output.line).to.equal('meta.graph.none');
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
        command: {
          index: 0,
          input: '',
          target: '',
          verb: META_HELP,
        },
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

      await localState.doCreate(TEST_WORLD.meta.id, 1);
      const pending = onceEvent<StateOutputEvent>(events, EVENT_STATE_OUTPUT);
      await localState.onCommand({
        actor,
        command: {
          index: 0,
          input: '',
          target: '',
          verb: META_HELP,
        },
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
        command: {
          index: 1,
          input: '',
          target: 'test://url',
          verb: META_LOAD,
        },
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
        command: {
          index: 1,
          input: '',
          target: 'test://url',
          verb: META_LOAD,
        },
      });

      const output = await pendingOutput;
      expect(output.line).to.equal('meta.load.none');
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
        command: {
          index: 0,
          input: '',
          target: '',
          verb: META_QUIT,
        },
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
        command: {
          index: 1,
          input: '',
          target: TEST_WORLD.meta.id,
          verb: META_CREATE,
        },
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
        command: {
          index: 1,
          input: '',
          target: 'test://url',
          verb: META_SAVE,
        },
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
        command: {
          index: 1,
          input: '',
          target: 'test://url',
          verb: META_SAVE,
        },
      });

      await expect(pendingOutput).to.eventually.deep.include({
        line: 'meta.save.none',
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
        command: {
          index: 0,
          input: '',
          target: '',
          verb: META_WORLDS,
        },
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

      await state.doCreate(TEST_WORLD.meta.id, 1);

      const pending = onceEvent<StateOutputEvent>(events, EVENT_STATE_OUTPUT);
      await state.onCommand({
        command: {
          index: 0,
          input: '',
          target: '',
          verb: VERB_WAIT,
        },
      });

      const output = await pending;
      expect(output.line).to.equal('meta.step.none');
    });

    it('should error without state', async () => {
      const module = new CoreModule();
      const container = await getTestContainer(module);

      const state = await container.create(LocalStateService);
      await state.start();

      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      const pending = onceEvent<StateOutputEvent>(events, EVENT_STATE_OUTPUT);
      await state.onCommand({
        actor: {} as Actor,
        command: {
          index: 0,
          input: '',
          target: '',
          verb: VERB_WAIT,
        },
      });

      const output = await pending;
      expect(output.line).to.equal('meta.step.none');
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
            },
            mods: TEST_ROOM.mods,
          }],
        }
      };
      const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
      events.emit(EVENT_LOADER_WORLD, { world });

      await state.doCreate(TEST_WORLD.meta.id, 1);
      const results = await state.stepFind({
        type: ACTOR_TYPE,
      });
      const actors = results.filter(isActor);

      const script = await container.create<LocalScriptService, BaseOptions>(INJECT_SCRIPT);
      const invokeStub = stub(script, 'invoke');

      const pending = onceEvent<StateStepEvent>(events, EVENT_STATE_STEP);
      for (const actor of actors) {
        await state.onCommand({
          actor,
          command: {
            index: 0,
            input: '',
            target: '',
            verb: VERB_WAIT,
          },
        });
      }

      await pending;

      expect(invokeStub).to.have.callCount(4); // one room, one actor, one item in each
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
  });

  describe('step enter helper', () => {
    xit('should populate portals with new rooms');
    xit('should notify the actor of their new room');
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

      await state.doCreate(TEST_WORLD.meta.id, 1);

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

      await state.doCreate(TEST_WORLD.meta.id, 1);

      const moving = makeTestActor('', '', '');
      const transfer = {
        moving,
        source: makeTestRoom('', '', '', [moving], []),
        target: makeTestRoom('', '', '', [], []),
      };
      await state.stepMove(transfer, {
        logger: getTestLogger(),
        script: createStubInstance(LocalScriptService),
        data: new Map(),
        random: await container.create(MathRandomGenerator),
        state: getStubHelper(),
        transfer: await container.create(StateEntityTransfer),
      });

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

      await state.doCreate(TEST_WORLD.meta.id, 1);

      const moving = makeTestItem('', '', '');
      const transfer = {
        moving,
        source: makeTestRoom('', '', '', [], [moving]),
        target: makeTestRoom('', '', '', [], []),
      };
      await state.stepMove(transfer, {
        logger: getTestLogger(),
        script: createStubInstance(LocalScriptService),
        data: new Map(),
        random: await container.create(MathRandomGenerator),
        state: getStubHelper(),
        transfer: await container.create(StateEntityTransfer),
      });

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

      await state.doCreate(TEST_WORLD.meta.id, 1);

      const transfer = {
        moving: makeTestRoom('', '', '', [], []) as any,
        source: makeTestRoom('', '', '', [], []),
        target: makeTestRoom('', '', '', [], []),
      };

      return expect(state.stepMove(transfer, {
        logger: getTestLogger(),
        script: createStubInstance(LocalScriptService),
        data: new Map(),
        random: await container.create(MathRandomGenerator),
        state: getStubHelper(),
        transfer: await container.create(StateEntityTransfer),
      })).to.eventually.be.rejectedWith(ScriptTargetError);
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

      await state.doCreate(TEST_WORLD.meta.id, 1);

      const pending = onceEvent<StateOutputEvent>(events, EVENT_STATE_OUTPUT);
      await state.stepShow('foo', {}, ShowVolume.SELF);

      const output = await pending;
      expect(output.line).to.equal('foo');
      expect(output.volume).to.equal(ShowVolume.SELF);
    });
  });
});
