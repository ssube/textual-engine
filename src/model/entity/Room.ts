import { SlotMap, VerbMap } from '../../util/types';
import { Metadata } from '../meta/Metadata';
import { Actor } from './Actor';
import { Item } from './Item';
import { Portal } from './Portal';

export interface Room {
  type: 'room',
  meta: Metadata;
  actors: Array<Actor>;
  items: Array<Item>;
  portals: Array<Portal>;
  slots: SlotMap;
  verbs: VerbMap;
}
