import { expect } from 'chai';

import { ACTOR_TYPE } from '../../../src/model/entity/Actor';
import { ITEM_TYPE } from '../../../src/model/entity/Item';
import { PORTAL_TYPE } from '../../../src/model/entity/Portal';
import { ROOM_TYPE } from '../../../src/model/entity/Room';
import { WorldState } from '../../../src/model/world/State';
import { findContainer, findMatching, findRoom, findSlotItem } from '../../../src/util/entity/find';
import { makeTestActor, makeTestItem, makeTestPortal, makeTestRoom, makeTestState } from '../../entity';

const TEST_STATE: WorldState = makeTestState('', [
  makeTestRoom('foo', 'foo', 'foo', [
    makeTestActor('bun', 'bun', 'bun', makeTestItem('bon', 'bon', 'bon'))
  ], [/* no items */], [
    makeTestPortal('p', 'p', 'p', 'p', 'foo'),
  ]),
  makeTestRoom('bar', 'bar', 'bar', [/* no actors */], [
    makeTestItem('bin', 'bin', 'bin'),
  ]),
]);

describe('entity find utils', () => {
  describe('find matching helper', () => {
    it('should return matching entities', async () => {
      expect(findMatching(TEST_STATE.rooms, {
        meta: {
          id: 'bar',
        },
        type: ROOM_TYPE,
      }), 'find room').to.deep.equal([
        TEST_STATE.rooms[1],
      ]);

      expect(findMatching(TEST_STATE.rooms, {
        meta: {
          id: 'bun',
        },
        type: ACTOR_TYPE,
      }), 'find actor').to.deep.equal([
        TEST_STATE.rooms[0].actors[0],
      ]);

      expect(findMatching(TEST_STATE.rooms, {
        meta: {
          id: 'bin',
        },
        type: ITEM_TYPE,
      }), 'find item').to.deep.equal([
        TEST_STATE.rooms[1].items[0],
      ]);

      expect(findMatching(TEST_STATE.rooms, {
        meta: {
          id: 'bon',
        },
        type: ITEM_TYPE,
      }), 'find inventory item').to.deep.equal([
        TEST_STATE.rooms[0].actors[0].items[0],
      ]);

      expect(findMatching(TEST_STATE.rooms, {
        meta: {
          id: 'p',
        },
        type: PORTAL_TYPE,
      }), 'find portal').to.deep.equal([
        TEST_STATE.rooms[0].portals[0],
      ]);
    });

    it('should skip the contents of rooms that do not match the room filter', async () => {
      const results = findMatching(TEST_STATE.rooms, {
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

    it('should skip the inventory of actors that do not match the actor filter', async () => {
      const state = makeTestState('', [
        makeTestRoom('', '', '', [
          makeTestActor('foo', 'Foo', '', makeTestItem('foo-item', '', '')),
          makeTestActor('bar', 'Bar', '', makeTestItem('bar-item', '', ''))
        ]),
      ]);
      const results = findMatching(state.rooms, {
        meta: {
          id: 'foo',
        },
        actor: {
          id: 'foo',
        },
        type: ITEM_TYPE,
      });

      expect(results).to.have.lengthOf(1);
    });
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

    it('should return the room containing a portal', async () => {
      const results = findContainer(TEST_STATE, {
        meta: {
          id: 'p',
        },
      });
      expect(results).to.deep.equal([
        TEST_STATE.rooms[0],
      ]);
    });

    it('should only check rooms matching the room filter', async () => {
      const results = findContainer(TEST_STATE, {
        meta: {
          id: 'bun', // exists in foo
        },
        room: {
          id: 'bar', // is not foo
        }
      });

      expect(results).to.have.lengthOf(0);
    });

    it('should only check actors matching the actor filter', async () => {
      const results = findContainer(TEST_STATE, {
        meta: {
          id: 'bon', // exists in bun
        },
        actor: {
          id: 'bar', // not an actor
        }
      });

      expect(results).to.have.lengthOf(0);
    });
  });

  describe('find equipped item helper', () => {
    it('should find the item in the slot', async () => {
      const item = makeTestItem('bar', '', '');
      const actor = makeTestActor('', '', '',
        makeTestItem('foo', '', ''),
        item
      );

      const slot = 'test';
      actor.slots.set(slot, 'bar');

      const result = findSlotItem(actor, slot);
      expect(result).to.equal(item);
    });

    it('should handle missing slots', async () => {
      const item = makeTestItem('bar', '', '');
      const actor = makeTestActor('', '', '',
        makeTestItem('foo', '', ''),
        item
      );

      const slot = 'test';
      const result = findSlotItem(actor, slot);
      expect(result).to.equal(undefined);
    });

    it('should handle empty slots', async () => {
      const item = makeTestItem('bar', '', '');
      const actor = makeTestActor('', '', '',
        makeTestItem('foo', '', ''),
        item
      );

      const slot = 'test';
      actor.slots.set(slot, '');

      const result = findSlotItem(actor, slot);
      expect(result).to.equal(undefined);
    });
  });
});
