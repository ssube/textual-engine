import { StatMap, VerbMap } from '../../util/types';
import { Metadata } from '../meta/Metadata';

export interface Item {
  type: 'item',
  meta: Metadata,
  slots: VerbMap;
  stats: StatMap;
}
