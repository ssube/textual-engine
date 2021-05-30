import { expect } from 'chai';

import { ACTOR_TYPE, ActorType } from '../../../src/model/entity/Actor';
import { ITEM_TYPE } from '../../../src/model/entity/Item';
import { ROOM_TYPE } from '../../../src/model/entity/Room';
import { WorldState } from '../../../src/model/world/State';
import { findContainer, findRoom, searchState } from '../../../src/util/state';

const TEST_STATE: WorldState = {
  meta: {
    desc: '',
    id: '',
    name: '',
    template: '',
  },
  rooms: [{
    actors: [{
      actorType: ActorType.DEFAULT,
      items: [{
        meta: {
          desc: 'bon',
          id: 'bon',
          name: 'bon',
          template: 'bon',
        },
        slots: new Map(),
        stats: new Map(),
        type: ITEM_TYPE,
        verbs: new Map(),
      }],
      meta: {
        desc: 'bun',
        id: 'bun',
        name: 'bun',
        template: 'bun',
      },
      skills: new Map(),
      slots: new Map(),
      stats: new Map(),
      type: ACTOR_TYPE,
    }],
    items: [],
    meta: {
      desc: 'foo',
      id: 'foo',
      name: 'foo',
      template: 'foo',
    },
    portals: [],
    slots: new Map(),
    type: ROOM_TYPE,
    verbs: new Map(),
  }, {
    actors: [],
    items: [{
      meta: {
        desc: 'bin',
        id: 'bin',
        name: 'bin',
        template: 'bin',
      },
      slots: new Map(),
      stats: new Map(),
      type: ITEM_TYPE,
      verbs: new Map(),
    }],
    meta: {
      desc: 'bar',
      id: 'bar',
      name: 'bar',
      template: 'bar',
    },
    portals: [],
    slots: new Map(),
    type: ROOM_TYPE,
    verbs: new Map(),
  }],
  start: {
    room: '',
  },
  step: {
    time: 0,
    turn: 0,
  },
  world: {
    depth: 0,
    id: '',
    seed: '',
  },
};

describe('state search utils', () => {
  describe('search state helper', () => {
    it('should return matching entities', async () => {
      const results = searchState(TEST_STATE, {
        meta: {
          id: 'bar',
        },
        type: ROOM_TYPE,
      });

      expect(results).to.deep.equal([
        TEST_STATE.rooms[1],
      ]);
    });

    it('should skip the contents of rooms that do not match the room filter', async () => {
      const results = searchState(TEST_STATE, {
        meta: {
          id: 'bin',
        },
        room: {
          id: 'foo',
        },
        type: ROOM_TYPE,
      });

      expect(results).to.deep.equal([]);
    });

    xit('should skip the inventory of actors that do not match the actor filter');
  });

  describe('find room helper', () => {
    it('should return the room containing an actor', async () => {
      const results = findRoom(TEST_STATE, {
        meta: {
          id: 'bun',
        },
      });
      expect(results).to.deep.equal([
        TEST_STATE.rooms[0],
      ]);
    });

    it('should return the room containing an item', async () => {
      const results = findRoom(TEST_STATE, {
        meta: {
          id: 'bin',
        },
      });
      expect(results).to.deep.equal([
        TEST_STATE.rooms[1],
      ]);
    });
  });

  describe('find container helper', () => {
    it('should return the actor containing an item', async () => {
      const results = findContainer(TEST_STATE, {
        meta: {
          id: 'bon',
        },
      });
      expect(results).to.deep.equal([
        TEST_STATE.rooms[0].actors[0],
      ]);
    });

    it('should return the room containing an actor', async () => {
      const results = findContainer(TEST_STATE, {
        meta: {
          id: 'bun',
        },
      });
      expect(results).to.deep.equal([
        TEST_STATE.rooms[0],
      ]);
    });

    it('should return the room containing an item', async () => {
      const results = findContainer(TEST_STATE, {
        meta: {
          id: 'bin',
        },
      });
      expect(results).to.deep.equal([
        TEST_STATE.rooms[1],
      ]);
    });
  });
});


