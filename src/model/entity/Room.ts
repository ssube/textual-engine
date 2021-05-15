import { SlotMap, VerbMap } from '../../util/types';
import { Metadata } from '../meta/Metadata';
import { Actor } from './Actor';
import { Entity } from './Base';
import { Item } from './Item';
import { Portal } from './Portal';

export const ROOM_TYPE = 'room';

export interface Room {
  type: typeof ROOM_TYPE,
  meta: Metadata;
  actors: Array<Actor>;
  items: Array<Item>;
  portals: Array<Portal>;
  slots: SlotMap;
  verbs: VerbMap;
}

export function isRoom(entity: Entity): entity is Room {
  return entity.type === ROOM_TYPE;
}
