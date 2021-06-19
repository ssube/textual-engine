import { expect } from 'chai';

import { entityMeta } from '../../src/util/logger';
import { makeTestActor, makeTestItem, makeTestPortal, makeTestRoom } from '../entity';

describe('logger utils', () => {
  describe('entity serializer', () => {
    it('should return entity metadata', async () => {
      const actor = makeTestActor('foo', 'bar', 'temp');
      const item = makeTestItem('foo', 'bar', 'temp');
      const portal = makeTestPortal('foo', 'bar', 'east', 'west', 'dest');
      const room = makeTestRoom('foo', 'bar', 'temp', [], []);

      expect(entityMeta(actor)).to.equal(actor.meta);
      expect(entityMeta(item)).to.equal(item.meta);
      expect(entityMeta(portal)).to.equal(portal.meta);
      expect(entityMeta(room)).to.equal(room.meta);
    });
  });
});
