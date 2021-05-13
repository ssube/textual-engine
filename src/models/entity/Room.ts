import { SlotMap } from '../../service/script';
import { Metadata } from '../meta/Metadata';
import { Actor } from './Actor';
import { Item } from './Item';

export interface Room {
  meta: Metadata;
  actors: Array<Actor>;
  items: Array<Item>;
  slots: SlotMap;
}
