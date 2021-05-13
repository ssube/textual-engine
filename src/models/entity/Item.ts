import { StatMap, VerbMap } from '../../utils/types';
import { Metadata } from '../meta/Metadata';

export interface Item {
  meta: Metadata;
  slots: VerbMap;
  stats: StatMap;
}
