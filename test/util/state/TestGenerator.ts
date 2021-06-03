import { expect } from 'chai';
import { Container, NullLogger } from 'noicejs';

import { ACTOR_TYPE, ActorType, isActor } from '../../../src/model/entity/Actor';
import { isItem, ITEM_TYPE } from '../../../src/model/entity/Item';
import { isRoom } from '../../../src/model/entity/Room';
import { WorldTemplate } from '../../../src/model/world/Template';
import { CoreModule } from '../../../src/module/CoreModule';
import { TEMPLATE_CHANCE } from '../../../src/util/constants';
import { StateEntityGenerator } from '../../../src/util/state/EntityGenerator';
import { getTestContainer } from '../../helper';

const TEST_WORLD: WorldTemplate = {
  defaults: {
    actor: {
      actorType: {
        base: '',
        type: 'string',
      },
      items: [],
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
      scripts: new Map(),
      stats: new Map(),
      type: {
        base: ACTOR_TYPE,
        type: 'string',
      },
    },
    item: {
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
      scripts: new Map(),
      stats: new Map(),
      type: {
        base: ITEM_TYPE,
        type: 'string',
      },
    },
    room: {
      actors: [],
      items: [],
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
      portals: [],
      scripts: new Map(),
      type: {
        base: ITEM_TYPE,
        type: 'string',
      },
    },
  },
  locale: {
    bundles: {},
    verbs: [],
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
        scripts: new Map(),
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
        scripts: new Map(),
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
        scripts: new Map(),
        type: {
          base: ITEM_TYPE,
          type: 'string',
        },
      },
      mods: [],
    }],
  },
};

describe('state entity generator', () => {
  describe('create actor helper', () => {
    it('should create actors with inventory', async () => {
      const container = Container.from(new CoreModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const generator = await container.create(StateEntityGenerator);
      generator.setWorld(TEST_WORLD);

      const actor = await generator.createActor(TEST_WORLD.templates.actors[0]);

      expect(isActor(actor)).to.equal(true);
      expect(actor.items.length).to.be.greaterThan(0);
    });
  });

  describe('create item helper', () => {
    it('should create items', async () => {
      const container = Container.from(new CoreModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const generator = await container.create(StateEntityGenerator);
      generator.setWorld(TEST_WORLD);

      const item = await generator.createItem(TEST_WORLD.templates.items[0]);

      expect(isItem(item)).to.equal(true);
      expect(item.stats.size).to.be.greaterThan(0);
    });
  });

  describe('create room helper', () => {
    it('should create a room with actors in it', async () => {
      const container = await getTestContainer(new CoreModule());
      const generator = await container.create(StateEntityGenerator);
      generator.setWorld(TEST_WORLD);

      const room = await generator.createRoom(TEST_WORLD.templates.rooms[0]);

      expect(isRoom(room)).to.equal(true);
      expect(room.actors.length).to.be.greaterThan(0);
    });
  });

  describe('modify actor helper', () => {
    it('should update meta fields', async () => {
      const container = await getTestContainer(new CoreModule());
      const generator = await container.create(StateEntityGenerator);
      generator.setWorld(TEST_WORLD);

      const actor = await generator.createActor(TEST_WORLD.templates.actors[0]);
      expect(isActor(actor)).to.equal(true);

      const original = actor.meta.name;
      await generator.modifyActor(actor, [{
        base: {
          actorType: {
            base: 'default',
            type: 'string',
          },
          items: [],
          meta: {
            desc: {
              base: '',
              type: 'string',
            },
            name: {
              base: 'foo {{base}}',
              type: 'string',
            },
          },
          type: {
            base: 'actor',
            type: 'string',
          },
          scripts: new Map(),
          stats: new Map(),
        },
        chance: TEMPLATE_CHANCE,
        excludes: [],
        id: 'test',
      }]);
      expect(original).not.to.equal(actor.meta.name);
    });
  });

  describe('modify item helper', () => {
    it('should update meta fields', async () => {
      const container = await getTestContainer(new CoreModule());
      const generator = await container.create(StateEntityGenerator);
      generator.setWorld(TEST_WORLD);

      const item = await generator.createItem(TEST_WORLD.templates.items[0]);
      expect(isItem(item)).to.equal(true);

      const original = item.meta.name;
      await generator.modifyItem(item, [{
        base: {
          meta: {
            desc: {
              base: '',
              type: 'string',
            },
            name: {
              base: 'foo {{base}}',
              type: 'string',
            },
          },
          type: {
            base: 'actor',
            type: 'string',
          },
          scripts: new Map(),
          stats: new Map(),
        },
        chance: TEMPLATE_CHANCE,
        excludes: [],
        id: 'test',
      }]);
      expect(original).not.to.equal(item.meta.name);
    });
  });

  describe('modify room helper', () => {
    xit('should update meta fields');
  });

  describe('modify meta helper', () => {
    xit('should not update id');
    xit('should update name');
  });

  describe('select modifiers helper', () => {
    xit('should select modifiers based on chance');
    xit('should not select excluded modifiers');
    xit('should select implied modifiers unless excluded');
  });

  describe('populate portals helper', () => {
    xit('should create destination rooms for unfilled portals');
  });
});
