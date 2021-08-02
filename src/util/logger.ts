import { isActor } from '../model/entity/Actor.js';
import { isItem } from '../model/entity/Item.js';
import { isPortal } from '../model/entity/Portal.js';
import { isRoom } from '../model/entity/Room.js';

// eslint-disable-next-line @typescript-eslint/ban-types,@typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
export function entityMeta(entity: any): object {
  if (isActor(entity) || isItem(entity) || isPortal(entity) || isRoom(entity)) {
    return entity.meta;
  } else {
    return entity;
  }
}
