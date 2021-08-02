import { expect } from 'chai';
import { getVerbScripts } from '../../../src/util/script/index.js';
import { makeTestActor, makeTestRoom } from '../../entity.js';

describe('script utils', () => {
  describe('verb script helper', () => {
    it('should remove scripts with an empty name', async () => {
      const actor = makeTestActor('', '', '');
      actor.scripts.set('verbs.foo', {
        data: new Map(),
        name: 'foo',
      });
      actor.scripts.set('verbs.bar', {
        data: new Map(),
        name: 'bar',
      });

      const room = makeTestRoom('', '', '');
      room.scripts.set('verbs.bar', {
        data: new Map(),
        name: '',
      });

      const verbs = getVerbScripts({
        actor,
        room,
      });

      expect(verbs).to.be.a('map').and.to.have.lengthOf(1); // only foo, bar should be removed
    });

    xit('should get scripts from the target entity');
    xit('should get scripts from items within the target entity');
    xit('should get scripts from the room containing the target entity');
    xit('should replace actor scripts with room scripts');
  });
});
