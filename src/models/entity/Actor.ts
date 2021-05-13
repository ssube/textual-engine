import { SlotMap } from '../../service/script';
import { SkillMap, StatMap } from '../../utils/types';
import { Metadata } from '../meta/Metadata';
import { Item } from './Item';

export enum ActorType {
  DEFAULT = 'default',
  PLAYER = 'player',
  REMOTE = 'remote',
}

export interface Actor {
  type: 'actor',

  /**
   * @todo should be named type, but that was already used
   */
  kind: ActorType,

  meta: Metadata;
  items: Array<Item>;
  skills: SkillMap;
  slots: SlotMap;
  stats: StatMap;
}
