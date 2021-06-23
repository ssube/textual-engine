import { doesExist } from '@apextoaster/js-utils';

import { WorldEntity } from '../../model/entity';
import { Actor, isActor } from '../../model/entity/Actor';
import { isItem, Item } from '../../model/entity/Item';
import { isRoom, Room } from '../../model/entity/Room';
import { ScriptMap } from '../../model/Script';
import { SIGNAL_PREFIX, VERB_PREFIX } from '../constants';

export interface VerbTarget {
  actor?: Actor;
  item?: Item;
  room?: Room;
}

export function getSignalScripts(target: WorldEntity): ScriptMap {
  const scripts: ScriptMap = new Map();

  for (const [name, script] of target.scripts) {
    if (name.startsWith(SIGNAL_PREFIX)) {
      scripts.set(name, script);
    }
  }

  return scripts;
}

/**
 * @todo optimize, currently on a hot path
 */
export function getVerbScripts(target: VerbTarget): ScriptMap {
  const scripts: ScriptMap = new Map();

  if (isActor(target.actor)) {
    mergeVerbScripts(scripts, target.actor.scripts);

    for (const item of target.actor.items) {
      mergeVerbScripts(scripts, item.scripts);
    }
  }

  if (isItem(target.item)) {
    mergeVerbScripts(scripts, target.item.scripts);
  }

  if (isRoom(target.room)) {
    mergeVerbScripts(scripts, target.room.scripts);

    // TODO: add room items?
  }

  const scriptNames = Array.from(scripts.keys()); // needs to be pulled AOT since the Map will be mutated
  for (const name of scriptNames) {
    const script = scripts.get(name);
    if (doesExist(script) && script.name.length === 0) {
      scripts.delete(name);
    }
  }

  return scripts;
}

export function mergeVerbScripts(target: ScriptMap, source: ScriptMap): void {
  for (const [name, script] of source) {
    if (name.startsWith(VERB_PREFIX)) {
      target.set(name, script);
    }
  }
}
