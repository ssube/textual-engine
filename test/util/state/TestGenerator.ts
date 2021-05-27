import { expect } from 'chai';
import { Container, NullLogger } from 'noicejs';

import { ACTOR_TYPE, ActorType, isActor } from '../../../src/model/entity/Actor';
import { isItem, ITEM_TYPE } from '../../../src/model/entity/Item';
import { isRoom } from '../../../src/model/entity/Room';
import { World } from '../../../src/model/World';
import { LocalModule } from '../../../src/module/LocalModule';
import { TEMPLATE_CHANCE } from '../../../src/util/constants';
import { StateEntityGenerator } from '../../../src/util/state/EntityGenerator';

const TEST_WORLD: World = {
  locale: {
    bundles: {},
  },
  meta: {
    desc: {
      base: '',
      type: 'string',
    },
    id: '',
    name: {
      base: '',
      type: 'string',
    },
  },
  start: {
    actors: [],
    rooms: [],
  },
  templates: {
    actors: [{
      base: {
        actorType: {
          base: ActorType.DEFAULT,
          type: 'string',
        },
        items: [{
          chance: TEMPLATE_CHANCE,
          id: 'item-foo',
          type: 'id',
        }],
        meta: {
          desc: {
            base: 'foo',
            type: 'string',
          },
          id: 'actor-foo',
          name: {
            base: 'foo',
            type: 'string',
          },
        },
        skills: new Map(),
        slots: new Map(),
        stats: new Map(),
        type: {
          base: ACTOR_TYPE,
          type: 'string',
        },
      },
      mods: [],
    }],
    items: [{
      base: {
        meta: {
          desc: {
            base: 'foo',
            type: 'string',
          },
          id: 'item-foo',
          name: {
            base: 'foo',
            type: 'string',
          },
        },
        slots: new Map(),
        stats: new Map([
          ['bar', {
            min: 0,
            max: 10,
            step: 1,
            type: 'number',
          }]
        ]),
        type: {
          base: ITEM_TYPE,
          type: 'string',
        },
        verbs: new Map(),
      },
      mods: [],
    }],
    rooms: [{
      base: {
        actors: [{
          chance: TEMPLATE_CHANCE,
          id: 'actor-foo',
          type: 'id',
        }],
        items: [],
        meta: {
          desc: {
            base: 'foo',
            type: 'string',
          },
          id: 'room-foo',
          name: {
            base: 'foo',
            type: 'string',
          },
        },
        portals: [],
        slots: new Map(),
        type: {
          base: ITEM_TYPE,
          type: 'string',
        },
        verbs: new Map(),
      },
      mods: [],
    }],
  },
};

describe('state entity generator', () => {
  describe('create actor helper', () => {
    it('should create actors with inventory', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const generator = await container.create(StateEntityGenerator, {
        world: TEST_WORLD,
      });
      const actor = await generator.createActor(TEST_WORLD.templates.actors[0]);

      expect(isActor(actor)).to.equal(true);
      expect(actor.items.length).to.be.greaterThan(0);
    });
  });

  describe('create item helper', () => {
    it('should create items', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const generator = await container.create(StateEntityGenerator, {
        world: TEST_WORLD,
      });
      const item = await generator.createItem(TEST_WORLD.templates.items[0]);

      expect(isItem(item)).to.equal(true);
      expect(item.stats.size).to.be.greaterThan(0);
    });
  });

  describe('create room helper', () => {
    it('should create a room with actors in it', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const generator = await container.create(StateEntityGenerator, {
        world: TEST_WORLD,
      });
      const room = await generator.createRoom(TEST_WORLD.templates.rooms[0]);

      expect(isRoom(room)).to.equal(true);
      expect(room.actors.length).to.be.greaterThan(0);
    });
  });

  xit('modify actor');
  xit('modify item');
  xit('modify room');
  xit('modify metadata');
  xit('select modifiers');
  xit('populate portals');
});
