import { mustExist } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { BaseOptions } from 'noicejs';

import { NotInitializedError } from '../../../src/error/NotInitializedError';
import { Actor, ACTOR_TYPE, ActorType } from '../../../src/model/entity/Actor';
import { Room, ROOM_TYPE } from '../../../src/model/entity/Room';
import { Template } from '../../../src/model/mapped/Template';
import { WorldTemplate } from '../../../src/model/world/Template';
import { INJECT_EVENT } from '../../../src/module';
import { CoreModule } from '../../../src/module/CoreModule';
import { EventBus } from '../../../src/service/event';
import { LoaderSaveEvent } from '../../../src/service/loader/events';
import { StateOutputEvent } from '../../../src/service/state/events';
import { LocalStateService } from '../../../src/service/state/LocalState';
import { onceEvent } from '../../../src/util/async/event';
import {
  EVENT_LOADER_SAVE,
  EVENT_LOADER_WORLD,
  EVENT_STATE_OUTPUT,
  META_CREATE,
  META_DEBUG,
  META_GRAPH,
  META_HELP,
  META_QUIT,
  META_VERBS,
  META_WORLDS,
  TEMPLATE_CHANCE,
} from '../../../src/util/constants';
import { StateEntityGenerator } from '../../../src/util/state/EntityGenerator';
import { getTestContainer } from '../../helper';

const TEST_ACTOR: Template<Actor> = {
  base: {
    actorType: {
      base: ActorType.DEFAULT,
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

const TEST_ROOM: Template<Room> = {
  base: {
    actors: [],
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
    item: {} as any,
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
    actors: [],
    rooms: [{
      chance: TEMPLATE_CHANCE,
      id: 'bar',
      type: 'id',
    }],
  },
  templates: {
    actors: [],
    items: [],
    rooms: [TEST_ROOM],
  },
};

describe('local state service', () => {
  it('should not step without state', async () => {
    const module = new CoreModule();
    const container = await getTestContainer(module);

    const state = await container.create(LocalStateService);
    await state.start();

    return expect(state.step()).to.eventually.be.rejectedWith(NotInitializedError);
  });

  xit('should add actor when a player joins');
  xit('should register world templates when they load');

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
    xit('should load state from path');
    xit('should load templates from path');
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
    xit('should save state to path');
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

  describe('state step', () => {
    xit('should invoke step script on each room');
    xit('should invoke step script on each actor');
    xit('should invoke step script on each item');
  });

  describe('step enter helper', () => {
    xit('should populate portals with new rooms');
    xit('should notify the actor of their new room');
  });

  describe('step find helper', () => {
    xit('should search state');
  });

  describe('step move helper', () => {
    xit('should move actors');
    xit('should move items');
    xit('should not allow moving rooms');
  });

  describe('step show helper', () => {
    xit('should emit messages');
  });
});
