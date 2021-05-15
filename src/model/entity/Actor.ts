import { SkillMap, SlotMap, StatMap } from '../../util/types';
import { Metadata } from '../meta/Metadata';
import { Entity } from './Base';
import { Item } from './Item';

export enum ActorType {
  DEFAULT = 'default',
  PLAYER = 'player',
  REMOTE = 'remote',
}

export const ACTOR_TYPE = 'actor';

export interface Actor {
  type: typeof ACTOR_TYPE;
  actorType: ActorType;
  meta: Metadata;
  items: Array<Item>;
  skills: SkillMap;
  slots: SlotMap;
  stats: StatMap;
}

export function isActor(entity: Entity): entity is Actor {
  return entity.type === ACTOR_TYPE;
}
