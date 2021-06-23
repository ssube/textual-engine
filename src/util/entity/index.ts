import { doesExist } from '@apextoaster/js-utils';

import { Actor } from '../../model/entity/Actor';
import { matchIdSegments } from '../string';
import { StringMap } from '../types';

export function equipItems(actor: Actor, items: StringMap): void {
  for (const [slot, id] of items) {
    if (actor.slots.has(slot)) {
      const item = actor.items.find((it) => matchIdSegments(it.meta.id, id));
      if (doesExist(item) && matchIdSegments(item.slot, slot)) {
        actor.slots.set(slot, item.meta.id);
      }
    }
  }
}
