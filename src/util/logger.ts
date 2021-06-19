import { isActor } from '../model/entity/Actor';
import { isItem } from '../model/entity/Item';
import { isPortal } from '../model/entity/Portal';
import { isRoom } from '../model/entity/Room';

export function entityMeta(entity: any): object {
  if (isActor(entity) || isItem(entity) || isPortal(entity) || isRoom(entity)) {
    return entity.meta;
  } else {
    return entity;
  }
}
