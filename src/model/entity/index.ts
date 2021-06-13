import { Actor, ActorType } from './Actor';
import { Item, ItemType } from './Item';
import { Room, RoomType } from './Room';

export type WorldEntity = Room | Item | Actor;

export type WorldEntityType = WorldEntity['type'];

export type EntityForType<TType> =
  TType extends ActorType ? Actor :
  TType extends ItemType ? Item :
  TType extends RoomType ? Room :
  never;
