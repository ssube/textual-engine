import { expect } from 'chai';

import { isActor } from '../../../src/model/entity/Actor';
import { indexEntity, matchEntity, matchMetadata, matchMetadataFuzzy } from '../../../src/util/entity/match';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../entity';

describe('entity match utils', () => {
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

  describe('match metadata helper', () => {
    it('should match if the ID starts with the search ID', async () => {
      const entity = makeTestRoom('foo-1', 'bar', '', [], []);

      expect(matchMetadata(entity, {
        id: 'foo',
      })).to.equal(true);
    });

    it('should check if the name contains the search string', async () => {
      const entity = makeTestRoom('foo', 'bar', '', [], []);

      expect(matchMetadata(entity, {
        name: 'a',
      })).to.equal(true);
    });
  });

  describe('match metadata fuzzy helper', () => {
    it('should match by default', async () => {
      const entity = makeTestRoom('foo', 'bar', '', [], []);

      expect(matchMetadataFuzzy(entity, {})).to.equal(true);
    });

    it('should match name or ID', async () => {
      const entity = makeTestRoom('foo', 'bar', '', [], []);

      expect(matchMetadataFuzzy(entity, {
        id: 'foo',
      })).to.equal(true);
      expect(matchMetadataFuzzy(entity, {
        name: 'bar',
      })).to.equal(true);
    });
  });
});
