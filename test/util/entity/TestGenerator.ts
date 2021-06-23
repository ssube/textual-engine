/* eslint-disable max-lines */
import { NotFoundError } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { BaseOptions } from 'noicejs';

import { LocaleService } from '../../../src/lib';
import { Actor, ACTOR_TYPE, ActorSource, isActor } from '../../../src/model/entity/Actor';
import { isItem, Item, ITEM_TYPE } from '../../../src/model/entity/Item';
import { Portal, PORTAL_TYPE, PortalLinkage } from '../../../src/model/entity/Portal';
import { isRoom, Room, ROOM_TYPE } from '../../../src/model/entity/Room';
import { Modifier } from '../../../src/model/mapped/Modifier';
import { Template } from '../../../src/model/mapped/Template';
import { WorldTemplate } from '../../../src/model/world/Template';
import { INJECT_LOCALE } from '../../../src/module';
import { CoreModule } from '../../../src/module/CoreModule';
import { PORTAL_DEPTH, TEMPLATE_CHANCE } from '../../../src/util/constants';
import { StateEntityGenerator } from '../../../src/util/entity/EntityGenerator';
import { getTestContainer } from '../../helper';

// #region fixtures
const TEST_ACTOR: Template<Actor> = {
  base: {
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
    slot: {
      base: '',
      type: 'string',
    },
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

const TEST_PORTAL_EAST: Template<Portal> = {
  base: {
    dest: {
      base: 'room-foo',
      type: 'string',
    },
    group: {
      key: {
        base: 'door',
        type: 'string',
      },
      source: {
        base: 'east',
        type: 'string',
      },
      target: {
        base: 'west',
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
      id: 'portal-door-east',
      name: {
        base: 'door',
        type: 'string',
      },
    },
    scripts: new Map(),
    type: {
      base: PORTAL_TYPE,
      type: 'string',
    },
  },
  mods: [],
};

const TEST_PORTAL_WEST: Template<Portal> = {
  base: {
    dest: {
      base: 'room-foo',
      type: 'string',
    },
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
      id: 'portal-door-west',
      name: {
        base: 'door',
        type: 'string',
      },
    },
    scripts: new Map(),
    type: {
      base: PORTAL_TYPE,
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
      chance: TEMPLATE_CHANCE,
      id: 'portal-door-east',
      type: 'id',
    }, {
      chance: TEMPLATE_CHANCE,
      id: 'portal-door-west',
      type: 'id',
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
      slots: new Map(),
      source: {
        base: '',
        type: 'string',
      },
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
    portal: {
      dest: {
        base: '',
        type: 'string',
      },
      link: {
        base: PortalLinkage.BOTH,
        type: 'string',
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
      group: {
        key: {
          base: '',
          type: 'string',
        },
        source: {
          base: '',
          type: 'string',
        },
        target: {
          base: '',
          type: 'string',
        },
      },
      scripts: new Map(),
      type: {
        base: PORTAL_TYPE,
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
    words: {
      articles: [],
      prepositions: [],
      verbs: [],
    },
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
    portals: [TEST_PORTAL_EAST, TEST_PORTAL_WEST],
    rooms: [TEST_ROOM],
  },
};

const TEST_ACTOR_MODS: Array<Modifier<Actor>> = [{
  base: {
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
    scripts: new Map(),
    slots: new Map(),
    source: {
      base: 'default',
      type: 'string',
    },
    stats: new Map(),
    type: {
      base: 'actor',
      type: 'string',
    },
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
    scripts: new Map(),
    slot: {
      base: '',
      type: 'string',
    },
    stats: new Map(),
    type: {
      base: 'actor',
      type: 'string',
    },
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
      const container = await getTestContainer(new CoreModule());
      const generator = await container.create(StateEntityGenerator);
      generator.setWorld(TEST_WORLD);

      const actor = await generator.createActor(TEST_ACTOR);

      expect(isActor(actor)).to.equal(true);
      expect(actor.items.length).to.be.greaterThan(0);
    });
  });

  describe('create item', () => {
    it('should create items', async () => {
      const container = await getTestContainer(new CoreModule());
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

  describe('create state', () => {
    it('should throw when the start room does not exist', async () => {
      const container = await getTestContainer(new CoreModule());
      const generator = await container.create(StateEntityGenerator);
      generator.setWorld(TEST_WORLD);

      return expect(generator.createState({
        ...TEST_WORLD,
        start: {
          actors: TEST_WORLD.start.actors,
          rooms: [{
            chance: TEMPLATE_CHANCE,
            id: 'foo',
            type: 'id',
          }],
        },
      }, {
        depth: 0,
        id: 'test',
        seed: 'test',
      })).to.eventually.be.rejectedWith(NotFoundError, 'value not found');
    });
  });

  describe('create lists', () => {
    it('should roll for each actor template', async () => {
      const container = await getTestContainer(new CoreModule());
      const generator = await container.create(StateEntityGenerator);
      generator.setWorld(TEST_WORLD);

      const actors = await generator.createActorList([{
        chance: 0,
        id: 'foo',
        type: 'id',
      }]);

      expect(actors).to.have.lengthOf(0);
    });

    xit('should throw when an actor template does not exist', async () => {
      const container = await getTestContainer(new CoreModule());
      const generator = await container.create(StateEntityGenerator);
      generator.setWorld(TEST_WORLD);

      return expect(generator.createActorList([{
        chance: TEMPLATE_CHANCE,
        id: 'foo',
        type: 'id',
      }])).to.eventually.be.rejectedWith();
    });

    it('should roll for each item template', async () => {
      const container = await getTestContainer(new CoreModule());
      const generator = await container.create(StateEntityGenerator);
      generator.setWorld(TEST_WORLD);

      const items = await generator.createItemList([{
        chance: 0,
        id: 'foo',
        type: 'id',
      }]);

      expect(items).to.have.lengthOf(0);

    });

    xit('should throw when an item template does not exist', async () => {
      const container = await getTestContainer(new CoreModule());
      const generator = await container.create(StateEntityGenerator);
      generator.setWorld(TEST_WORLD);

      return expect(generator.createItemList([{
        chance: TEMPLATE_CHANCE,
        id: 'foo',
        type: 'id',
      }])).to.eventually.be.rejectedWith();
    });

    it('should roll for each portal template', async () => {
      const container = await getTestContainer(new CoreModule());
      const generator = await container.create(StateEntityGenerator);
      generator.setWorld(TEST_WORLD);

      const portals = await generator.createPortalList([{
        chance: 0,
        id: 'foo',
        type: 'id',
      }]);

      expect(portals).to.have.lengthOf(0);

    });

    xit('should throw when an portal template does not exist', async () => {
      const container = await getTestContainer(new CoreModule());
      const generator = await container.create(StateEntityGenerator);
      generator.setWorld(TEST_WORLD);

      return expect(generator.createPortalList([{
        chance: TEMPLATE_CHANCE,
        id: 'foo',
        type: 'id',
      }])).to.eventually.be.rejectedWith();
    });
  });

  describe('modify actor', () => {
    it('should update meta fields', async () => {
      const container = await getTestContainer(new CoreModule());

      const locale = await container.create<LocaleService, BaseOptions>(INJECT_LOCALE);
      await locale.start();

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

      const locale = await container.create<LocaleService, BaseOptions>(INJECT_LOCALE);
      await locale.start();

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

      const locale = await container.create<LocaleService, BaseOptions>(INJECT_LOCALE);
      await locale.start();

      const generator = await container.create(StateEntityGenerator);
      generator.setWorld(TEST_WORLD);

      const item = await generator.createItem(TEST_ITEM);
      expect(isItem(item)).to.equal(true);

      const original = item.meta.name;
      await generator.modifyItem(item, TEST_ITEM_MODS);
      expect(original).not.to.equal(item.meta.name);
    });
  });

  describe('modify portal', () => {
    xit('should update meta fields');
    xit('should update group fields');
    xit('should update link type');
    xit('should update script map');
  });

  describe('modify room', () => {
    it('should add actors', async () => {
      const container = await getTestContainer(new CoreModule());

      const locale = await container.create<LocaleService, BaseOptions>(INJECT_LOCALE);
      await locale.start();

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

      const locale = await container.create<LocaleService, BaseOptions>(INJECT_LOCALE);
      await locale.start();

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

      const locale = await container.create<LocaleService, BaseOptions>(INJECT_LOCALE);
      await locale.start();

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
      expect(startRoom.portals, 'start room portals').to.have.lengthOf(2);

      const newRooms = await generator.populateRoom(startRoom, [], PORTAL_DEPTH);
      expect(newRooms, 'new rooms').to.have.lengthOf(4);

      for (const room of newRooms) {
        expect(isRoom(room), `room entity for ${room.meta.id}`).to.equal(true);
        expect(room.portals, `room portals for ${room.meta.id}`).to.have.length.greaterThan(0);
      }
    });

    xit('should not generate rooms for already filled portals');
    xit('should link back portals in rooms with a matching portal');
    xit('should add new back portals to rooms without a matching target group');
    xit('should not generate back portals for unidirectional portals');
  });
});
