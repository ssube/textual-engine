/* eslint-disable max-lines */
import { expect } from 'chai';
import { Container, NullLogger } from 'noicejs';

import { Actor, ACTOR_TYPE, ActorType, isActor } from '../../../src/model/entity/Actor';
import { isItem, Item, ITEM_TYPE } from '../../../src/model/entity/Item';
import { isRoom, Room, ROOM_TYPE } from '../../../src/model/entity/Room';
import { Modifier } from '../../../src/model/mapped/Modifier';
import { Template } from '../../../src/model/mapped/Template';
import { WorldTemplate } from '../../../src/model/world/Template';
import { CoreModule } from '../../../src/module/CoreModule';
import { TEMPLATE_CHANCE } from '../../../src/util/constants';
import { StateEntityGenerator } from '../../../src/util/state/EntityGenerator';
import { getTestContainer } from '../../helper';

// #region fixtures
const TEST_ACTOR: Template<Actor> = {
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
};

const TEST_ITEM: Template<Item> = {
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
};

const TEST_ROOM: Template<Room> = {
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
};

const TEST_ROOM_PORTALS: Template<Room> = {
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
    portals: [{
      dest: {
        base: 'room-foo',
        type: 'string',
      },
      link: {
        base: 'both',
        type: 'string',
      },
      name: {
        base: 'door',
        type: 'string',
      },
      sourceGroup: {
        base: 'west',
        type: 'string',
      },
      targetGroup: {
        base: 'east',
        type: 'string',
      },
    }],
    scripts: new Map(),
    type: {
      base: ITEM_TYPE,
      type: 'string',
    },
  },
  mods: [],
};

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
    actors: [TEST_ACTOR],
    items: [TEST_ITEM],
    rooms: [TEST_ROOM],
  },
};

const TEST_ACTOR_MODS: Array<Modifier<Actor>> = [{
  base: {
    actorType: {
      base: 'default',
      type: 'string',
    },
    items: [{
      chance: TEMPLATE_CHANCE,
      id: TEST_ITEM.base.meta.id,
      type: 'id',
    }],
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
}];

const TEST_ITEM_MODS: Array<Modifier<Item>> = [{
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
}];

const TEST_ROOM_MODS: Array<Modifier<Room>> = [{
  base: {
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
    meta: {
      desc: {
        base: '',
        type: 'string',
      },
      name: {
        base: '',
        type: 'string',
      },
    },
    portals: [],
    scripts: new Map(),
    type: {
      base: ROOM_TYPE,
      type: 'string',
    }
  },
  chance: TEMPLATE_CHANCE,
  excludes: [],
  id: 'test',
}];
// #endregion fixtures

describe('state entity generator', () => {
  describe('create actor', () => {
    it('should create actors with inventory', async () => {
      const container = Container.from(new CoreModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const generator = await container.create(StateEntityGenerator);
      generator.setWorld(TEST_WORLD);

      const actor = await generator.createActor(TEST_ACTOR);

      expect(isActor(actor)).to.equal(true);
      expect(actor.items.length).to.be.greaterThan(0);
    });
  });

  describe('create item', () => {
    it('should create items', async () => {
      const container = Container.from(new CoreModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const generator = await container.create(StateEntityGenerator);
      generator.setWorld(TEST_WORLD);

      const item = await generator.createItem(TEST_ITEM);

      expect(isItem(item)).to.equal(true);
      expect(item.stats.size).to.be.greaterThan(0);
    });
  });

  describe('create room', () => {
    it('should create a room with actors in it', async () => {
      const container = await getTestContainer(new CoreModule());
      const generator = await container.create(StateEntityGenerator);
      generator.setWorld(TEST_WORLD);

      const room = await generator.createRoom(TEST_ROOM);

      expect(isRoom(room)).to.equal(true);
      expect(room.actors.length).to.be.greaterThan(0);
    });
  });

  describe('modify actor', () => {
    it('should update meta fields', async () => {
      const container = await getTestContainer(new CoreModule());
      const generator = await container.create(StateEntityGenerator);
      generator.setWorld(TEST_WORLD);

      const actor = await generator.createActor(TEST_ACTOR);
      expect(isActor(actor)).to.equal(true);

      const original = actor.meta.name;
      await generator.modifyActor(actor, TEST_ACTOR_MODS);
      expect(original).not.to.equal(actor.meta.name);
    });

    it('should add inventory items', async () => {
      const container = await getTestContainer(new CoreModule());
      const generator = await container.create(StateEntityGenerator);
      generator.setWorld(TEST_WORLD);

      const actor = await generator.createActor(TEST_ACTOR);
      expect(actor.items).to.have.lengthOf(1);

      await generator.modifyActor(actor, TEST_ACTOR_MODS);
      expect(actor.items).to.have.lengthOf(2);
    });
  });

  describe('modify item', () => {
    it('should update meta fields', async () => {
      const container = await getTestContainer(new CoreModule());
      const generator = await container.create(StateEntityGenerator);
      generator.setWorld(TEST_WORLD);

      const item = await generator.createItem(TEST_ITEM);
      expect(isItem(item)).to.equal(true);

      const original = item.meta.name;
      await generator.modifyItem(item, TEST_ITEM_MODS);
      expect(original).not.to.equal(item.meta.name);
    });
  });

  describe('modify room', () => {
    it('should add actors', async () => {
      const container = await getTestContainer(new CoreModule());
      const generator = await container.create(StateEntityGenerator);
      generator.setWorld(TEST_WORLD);

      const room = await generator.createRoom(TEST_ROOM);
      expect(isRoom(room)).to.equal(true);
      expect(room.actors).to.have.lengthOf(1);

      await generator.modifyRoom(room, TEST_ROOM_MODS);
      expect(room.actors).to.have.lengthOf(2);
    });

    it('should add items', async () => {
      const container = await getTestContainer(new CoreModule());
      const generator = await container.create(StateEntityGenerator);
      generator.setWorld(TEST_WORLD);

      const room = await generator.createRoom(TEST_ROOM);
      expect(isRoom(room)).to.equal(true);
      expect(room.items).to.have.lengthOf(0);

      await generator.modifyRoom(room, TEST_ROOM_MODS);
      expect(room.items).to.have.lengthOf(1);
    });

    xit('should update meta fields');
  });

  describe('modify meta', () => {
    xit('should not update id');
    xit('should update name');
  });

  describe('select modifiers', () => {
    it('should select modifiers based on chance', async () => {
      const container = await getTestContainer(new CoreModule());
      const generator = await container.create(StateEntityGenerator);
      generator.setWorld(TEST_WORLD);

      const actor = await generator.createActor(TEST_ACTOR);
      expect(actor.items).to.have.lengthOf(1);

      await generator.modifyActor(actor, [{
        ...TEST_ACTOR_MODS[0],
        chance: 0,
      }]);
      expect(actor.items).to.have.lengthOf(1);
    });

    it('should not select excluded modifiers', async () => {
      const container = await getTestContainer(new CoreModule());
      const generator = await container.create(StateEntityGenerator);
      generator.setWorld(TEST_WORLD);

      const actor = await generator.createActor(TEST_ACTOR);
      expect(actor.items).to.have.lengthOf(1);

      const mod = TEST_ACTOR_MODS[0];
      await generator.modifyActor(actor, [{
        ...mod,
        excludes: ['second'],
      }, {
        ...mod,
        base: {
          ...mod.base,
          meta: {
            ...mod.base.meta,
            name: {
              base: 'second {{base}}',
              type: 'string',
            },
          },
        },
        id: 'second',
      }]);

      expect(actor.meta.name).to.equal('foo foo');
    });

    xit('should select implied modifiers unless excluded');
  });

  describe('populate portals', () => {
    it('should create destination rooms for unfilled portals', async () => {
      const container = await getTestContainer(new CoreModule());
      const generator = await container.create(StateEntityGenerator);
      generator.setWorld({
        ...TEST_WORLD,
        templates: {
          ...TEST_WORLD.templates,
          rooms: [TEST_ROOM_PORTALS],
        },
      });

      const startRoom = await generator.createRoom(TEST_ROOM_PORTALS);
      expect(startRoom.portals).to.have.lengthOf(0);

      const newRooms = await generator.populateRoom(startRoom, 4);
      expect(newRooms).to.have.lengthOf(5);

      for (const room of newRooms) {
        expect(isRoom(room), 'room entity').to.equal(true);
        expect(room.portals, 'room portals').to.have.length.greaterThan(0);
      }
    });

    xit('should not generate rooms for already filled portals');
    xit('should link back portals in rooms with a matching portal');
    xit('should add new back portals to rooms without a matching target group');
    xit('should not generate back portals for unidirectional portals');
  });
});
