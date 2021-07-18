import { expect } from 'chai';

import { equipItems, filterEquipped } from '../../../src/util/entity';
import { makeTestActor, makeTestItem } from '../../entity';

describe('entity utils', () => {
  describe('equip items helper', () => {
    it('should equip available items', async () => {
      const footItem = makeTestItem('foo', '', '');
      footItem.slot = 'foot';

      const handItem = makeTestItem('bar', '', '');
      handItem.slot = 'hand';

      const actor = makeTestActor('', '', '',
        footItem,
        handItem,
      );
      actor.slots.set('foot', '').set('hand', '');

      equipItems(actor, new Map([
        ['foot', footItem.meta.id],
        ['hand', handItem.meta.id],
      ]));

      expect(actor.slots.get('foot')).to.equal(footItem.meta.id);
      expect(actor.slots.get('hand')).to.equal(handItem.meta.id);
    });

    it('should only equip items with the right slot', async () => {
      const footItem = makeTestItem('foo', '', '');
      footItem.slot = 'foot';

      const handItem = makeTestItem('bar', '', '');
      handItem.slot = 'foot'; // also foot

      const actor = makeTestActor('', '', '',
        footItem,
        handItem,
      );
      actor.slots.set('foot', '').set('hand', '');

      equipItems(actor, new Map([
        ['foot', footItem.meta.id],
        ['hand', handItem.meta.id],
      ]));

      expect(actor.slots.get('foot')).to.equal(footItem.meta.id);
      expect(actor.slots.get('hand')).to.equal('');
    });

    it('should equip the last instance on duplicate slots', async () => {
      const firstItem = makeTestItem('foo', '', '');
      firstItem.slot = 'foot';

      const secondItem = makeTestItem('bar', '', '');
      secondItem.slot = 'foot'; // also foot

      const actor = makeTestActor('', '', '',
        firstItem,
        secondItem,
      );
      actor.slots.set('foot', '').set('hand', '');

      equipItems(actor, new Map([
        ['foot', firstItem.meta.id],
        ['foot', secondItem.meta.id],
      ]));

      expect(actor.slots.get('foot')).to.equal(secondItem.meta.id);
      expect(actor.slots.get('hand')).to.equal('');
    });

    it('should ignore slots that are not present on the actor', async () => {
      const footItem = makeTestItem('foo', '', '');
      footItem.slot = 'foot';

      const handItem = makeTestItem('bar', '', '');
      handItem.slot = 'hand';

      const actor = makeTestActor('', '', '',
        footItem,
        handItem,
      );
      actor.slots.set('foot', ''); // no hand

      equipItems(actor, new Map([
        ['foot', footItem.meta.id],
        ['hand', handItem.meta.id],
      ]));

      expect(actor.slots.get('foot')).to.equal(footItem.meta.id);
      expect(actor.slots.get('hand')).to.equal(undefined);
    });

    it('should leave existing items equipped when nothing matches', async () => {
      const footItem = makeTestItem('foo', '', '');
      footItem.slot = 'foot';

      const actor = makeTestActor('', '', '',
        footItem,
      );
      actor.slots.set('foot', '').set('hand', 'bin');

      equipItems(actor, new Map([
        ['foot', footItem.meta.id],
        ['hand', 'bun'], // does not exist
      ]));

      expect(actor.slots.get('foot')).to.equal(footItem.meta.id);
      expect(actor.slots.get('hand')).to.equal('bin');
    });
  });

  describe('filter equipped items helper', () => {
    it('should only return equipped items', async () => {
      const footItem = makeTestItem('foo', '', '');
      footItem.slot = 'foot';

      const handItem = makeTestItem('bar', '', '');
      handItem.slot = 'hand';

      const actor = makeTestActor('', '', '',
        footItem,
        handItem,
        makeTestItem('other1', '', ''),
        makeTestItem('other2', '', ''),
      );
      actor.slots.set('foot', '').set('hand', '');

      equipItems(actor, new Map([
        ['foot', footItem.meta.id],
        ['hand', handItem.meta.id],
      ]));

      expect(filterEquipped(actor)).to.have.lengthOf(2);
    });
  });
});
