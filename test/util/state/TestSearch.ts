import { expect } from 'chai';

import { ROOM_TYPE } from '../../../src/model/entity/Room';
import { WorldState } from '../../../src/model/world/State';
import { findContainer, findRoom, searchState } from '../../../src/util/state';
import { makeTestActor, makeTestItem, makeTestRoom, makeTestState } from '../../entity';

const TEST_STATE: WorldState = makeTestState('', [
  makeTestRoom('foo', 'foo', 'foo', [
    makeTestActor('bun', 'bun', 'bun', makeTestItem('bon', 'bon', 'bon'))
  ], [/* no items */]),
  makeTestRoom('bar', 'bar', 'bar', [/* no actors */], [
    makeTestItem('bin', 'bin', 'bin'),
  ]),
]);

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


