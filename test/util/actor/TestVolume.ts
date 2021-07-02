import { expect } from 'chai';

import { checkVolume, ShowVolume } from '../../../src/util/actor';
import { makeTestActor, makeTestRoom } from '../../entity';

describe('actor utils', () => {
  describe('show volume helper', () => {
    it('should show volume self from the same actor', async () => {
      const sourceActor = makeTestActor('foo', 'foo', 'foo');
      const targetActor = makeTestActor('bar', 'bar', 'bar');
      const room = makeTestRoom('room-foo', 'foo', 'foo', [sourceActor, targetActor], []);

      expect(checkVolume({
        actor: sourceActor,
        room,
      }, {
        actor: sourceActor,
        room,
      }, ShowVolume.SELF), 'same actor in the same room').to.equal(true);

      expect(checkVolume({
        actor: sourceActor,
        room,
      }, {
        actor: targetActor,
        room,
      }, ShowVolume.SELF), 'different actor in the same room').to.equal(false);
    });

    it('should not show volume self when the source or target actor is missing', async () => {
      const sourceActor = makeTestActor('foo', 'foo', 'foo');
      const room = makeTestRoom('room-foo', 'foo', 'foo', [sourceActor], []);

      expect(checkVolume({
        actor: sourceActor,
        room,
      }, {
        room,
      }, ShowVolume.SELF)).to.equal(false);
    });

    it('should show volume room from the same room', async () => {
      const sourceActor = makeTestActor('foo', 'foo', 'foo');
      const sourceRoom = makeTestRoom('room-foo', 'foo', 'foo', [sourceActor], []);

      const targetActor = makeTestActor('bar', 'bar', 'bar');
      const targetRoom = makeTestRoom('room-bar', 'bar', 'bar', [targetActor], []);

      expect(checkVolume({
        actor: sourceActor,
        room: sourceRoom,
      }, {
        actor: targetActor,
        room: sourceRoom,
      }, ShowVolume.ROOM), 'different actor in the same room').to.equal(true);

      expect(checkVolume({
        actor: sourceActor,
        room: sourceRoom,
      }, {
        actor: targetActor,
        room: targetRoom,
      }, ShowVolume.ROOM), 'different actor in a different room').to.equal(false);
    });

    it('should always show volume world', async () => {
      const sourceActor = makeTestActor('foo', 'foo', 'foo');
      const sourceRoom = makeTestRoom('room-foo', 'foo', 'foo', [sourceActor], []);

      const targetActor = makeTestActor('bar', 'bar', 'bar');
      const targetRoom = makeTestRoom('room-bar', 'bar', 'bar', [targetActor], []);

      expect(checkVolume({
        actor: sourceActor,
        room: sourceRoom,
      }, {
        actor: targetActor,
        room: targetRoom,
      }, ShowVolume.WORLD)).to.equal(true);
    });
  });
});
