import { SlotMap, StatMap, VerbMap } from '../../util/types';
import { Metadata } from '../meta/Metadata';

export interface Item {
  type: 'item'
  meta: Metadata,
  slots: SlotMap;
  stats: StatMap;
  verbs: VerbMap;
}
