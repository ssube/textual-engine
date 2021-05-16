import { Actor } from './Actor';
import { Item } from './Item';
import { Room } from './Room';

export type WorldEntity = Room | Item | Actor;

export type WorldEntityType = WorldEntity['type'];
