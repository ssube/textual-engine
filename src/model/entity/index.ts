/* eslint-disable @typescript-eslint/indent */
import { Actor, ActorType } from './Actor.js';
import { Item, ItemType } from './Item.js';
import { Portal, PortalType } from './Portal.js';
import { Room, RoomType } from './Room.js';

export type WorldEntity = Room | Portal | Item | Actor;

export type WorldEntityType = WorldEntity['type'];

export type EntityForType<TType> =
  TType extends ActorType ? Actor :
  TType extends ItemType ? Item :
  TType extends PortalType ? Portal :
  TType extends RoomType ? Room :
  never;
