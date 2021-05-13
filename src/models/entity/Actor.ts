import { SlotMap } from '../../service/script';
import { SkillMap, StatMap } from '../../utils/types';
import { Metadata } from '../meta/Metadata';
import { Item } from './Item';

export interface Actor {
  meta: Metadata;
  items: Array<Item>;
  skills: SkillMap;
  slots: SlotMap;
  stats: StatMap;
}
