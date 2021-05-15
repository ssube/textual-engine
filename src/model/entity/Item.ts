import { SlotMap, StatMap, VerbMap } from '../../util/types';
import { Metadata } from '../meta/Metadata';
import { Entity } from './Base';

export const ITEM_TYPE = 'item';

export interface Item {
  type: typeof ITEM_TYPE;
  meta: Metadata,
  slots: SlotMap;
  stats: StatMap;
  verbs: VerbMap;
}

export function isItem(entity: Entity): entity is Item {
  return entity.type === ITEM_TYPE;
}
