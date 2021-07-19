import { doesExist } from '@apextoaster/js-utils';

import { ReadonlyActor } from '../../model/entity/Actor';
import { ReadonlyRoom } from '../../model/entity/Room';

export enum ShowVolume {
  SELF = 'self', // narrowest scope
  ROOM = 'room',
  WORLD = 'world',
}

export interface StateSource {
  actor?: ReadonlyActor;
  room: ReadonlyRoom;
  // TODO: add world ID
}

export function checkVolume(source: StateSource, target: StateSource, volume: ShowVolume): boolean {
  if (volume === ShowVolume.SELF) {
    if (doesExist(source.actor) && doesExist(target.actor)) {
      return source.actor.meta.id === target.actor.meta.id; // currently focused actor
    } else {
      return false;
    }
  }

  if (volume === ShowVolume.ROOM) {
    return source.room.meta.id === target.room.meta.id;
  }

  return true;
}
