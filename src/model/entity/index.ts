import { Actor, ACTOR_TYPE } from './Actor';
import { Item, ITEM_TYPE } from './Item';
import { Room, ROOM_TYPE } from './Room';

export type WorldEntity = Room | Item | Actor;

export type WorldEntityType = WorldEntity['type'];

export type WorldEntityFromType<TType extends WorldEntityType> =
  TType extends typeof ACTOR_TYPE ? Actor :
  TType extends typeof ITEM_TYPE ? Item :
  TType extends typeof ROOM_TYPE ? Room :
  never;
