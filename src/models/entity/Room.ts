import { SlotMap } from '../../service/script';
import { Metadata } from '../meta/Metadata';
import { Actor } from './Actor';
import { Item } from './Item';
import { Portal } from './Portal';

export interface Room {
  meta: Metadata;
  actors: Array<Actor>;
  items: Array<Item>;
  portals: Array<Portal>;
  slots: SlotMap;
}
