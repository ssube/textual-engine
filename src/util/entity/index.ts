import { doesExist } from '@apextoaster/js-utils';

import { Actor } from '../../model/entity/Actor';
import { Item } from '../../model/entity/Item';
import { Portal } from '../../model/entity/Portal';
import { StepResult } from '../../service/state';
import { getKey } from '../collection/map';
import { STAT_CLOSED, STAT_LOCKED } from '../constants';
import { matchIdSegments } from '../string';
import { Immutable, StringMap } from '../types';

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

export function filterEquipped(actor: Actor): Array<Item> {
  const equipped = new Set(actor.slots.values());
  return actor.items.filter((it) => equipped.has(it.meta.id));
}

export function isDestPortal(source: Portal, other: Portal): boolean {
  return other.dest === ''
    && other.group.key === source.group.key
    && other.group.target === source.group.source;
}

export function getPortalStats(portal: Immutable<Portal>): {
  closed: boolean;
  locked: boolean;
} {
  return {
    closed: getKey(portal.stats, STAT_CLOSED, 0) > 0,
    locked: getKey(portal.stats, STAT_LOCKED, 0) > 0,
  };
}

export function zeroStep(): StepResult {
  return {
    time: 0,
    turn: 0,
  };
}
