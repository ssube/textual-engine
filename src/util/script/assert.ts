import { ScriptTargetError } from '../../error/ScriptTargetError.js';
import { Actor, isActor } from '../../model/entity/Actor.js';
import { isItem, Item } from '../../model/entity/Item.js';
import { isPortal, Portal } from '../../model/entity/Portal.js';
import { isRoom, Room } from '../../model/entity/Room.js';
import { ScriptTarget } from '../../service/script/index.js';
import { Immutable } from '../types.js';

export function assertActor(it: ScriptTarget): Immutable<Actor> {
  const val = it;
  if (isActor(val)) {
    return val;
  }

  throw new ScriptTargetError('script target must be an actor');
}

export function assertItem(it: ScriptTarget): Immutable<Item> {
  const val = it;
  if (isItem(val)) {
    return val;
  }

  throw new ScriptTargetError('script target must be an item');
}

export function assertPortal(it: ScriptTarget): Immutable<Portal> {
  const val = it;
  if (isPortal(val)) {
    return val;
  }

  throw new ScriptTargetError('script target must be a portal');
}

export function assertRoom(it: ScriptTarget): Immutable<Room> {
  const val = it;
  if (isRoom(val)) {
    return val;
  }

  throw new ScriptTargetError('script target must be a room');
}
