import { doesExist } from '@apextoaster/js-utils';

import { Actor } from '../../model/entity/Actor';
import { Portal } from '../../model/entity/Portal';
import { StepResult } from '../../service/state';
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

export function isDestPortal(source: Portal, other: Portal): boolean {
  return other.dest === ''
    && other.group.key === source.group.key
    && other.group.target === source.group.source;
}

export function zeroStep(): StepResult {
  return {
    time: 0,
    turn: 0,
  };
}
