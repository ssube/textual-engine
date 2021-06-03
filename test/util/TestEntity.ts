import { expect } from 'chai';

import { isActor } from '../../src/model/entity/Actor';
import { indexEntity, matchEntity } from '../../src/util/entity';
import { makeTestActor, makeTestItem } from '../entity';

describe('entity utils', () => {
  describe('index entity helper', () => {
    it('should return the entity at the given index if it is the correct type', async () => {
      const actors = [
        makeTestActor('foo', 'foo', 'foo'),
        makeTestActor('bar', 'bar', 'bar'),
        makeTestItem('', '', ''),
        makeTestActor('bin', 'bin', 'bin'),
      ];

      expect(indexEntity(actors, 1, isActor)).to.equal(actors[1]);
      expect(indexEntity(actors, 2, isActor)).to.equal(undefined);
    });

    it('should handle indexes outside of the array', async () => {
      expect(indexEntity([], 2, isActor)).to.equal(undefined);
      expect(indexEntity([
        makeTestActor('foo', 'foo', 'foo'),
      ], 90, isActor)).to.equal(undefined);
    });
  });

  describe('match entity helper', () => {
    it('should check the entity type', async () => {
      expect(matchEntity(makeTestActor('', '', ''), {
        type: 'actor',
      }), 'actor is actor').to.equal(true);
      expect(matchEntity(makeTestActor('', '', ''), {
        type: 'item',
      }), 'actor is item').to.equal(false);
    });

    it('should check the entity metadata', async () => {
      expect(matchEntity(makeTestActor('foo', '', ''), {
        meta: {
          id: 'foo',
        },
        type: 'actor',
      }), 'actor foo with meta foo').to.equal(true);
      expect(matchEntity(makeTestActor('foo', '', ''), {
        meta: {
          id: 'bar',
        },
        type: 'actor',
      }), 'actor foo with meta bar').to.equal(false);
    });
  });

  describe('match entity metadata helper', () => {
    xit('should match if the ID starts with the search ID');
    xit('should check if the name contains the search string');
  });
});
