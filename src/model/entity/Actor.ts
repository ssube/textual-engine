import { SkillMap, SlotMap, StatMap } from '../../util/types';
import { Metadata } from '../meta/Metadata';
import { Item } from './Item';

export enum ActorType {
  DEFAULT = 'default',
  PLAYER = 'player',
  REMOTE = 'remote',
}

export interface Actor {
  type: 'actor';
  actorType: ActorType;
  meta: Metadata;
  items: Array<Item>;
  skills: SkillMap;
  slots: SlotMap;
  stats: StatMap;
}
