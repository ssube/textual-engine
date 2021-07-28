import { doesExist } from '@apextoaster/js-utils';

import { isActor, ReadonlyActor } from '../../model/entity/Actor.js';
import { isItem, ReadonlyItem } from '../../model/entity/Item.js';
import { isRoom, ReadonlyRoom } from '../../model/entity/Room.js';
import { ImmutableScriptMap, ScriptMap, ScriptRef } from '../../model/Script.js';
import { ScriptTarget } from '../../service/script/index.js';
import { SIGNAL_PREFIX, VERB_PREFIX } from '../constants.js';
import { Immutable } from '../types.js';

export interface VerbTarget {
  actor?: ReadonlyActor;
  item?: ReadonlyItem;
  room?: ReadonlyRoom;
}

export function getSignalScripts(target: ScriptTarget): ScriptMap {
  const scripts: ScriptMap = new Map();

  for (const [name, script] of target.scripts) {
    if (name.startsWith(SIGNAL_PREFIX)) {
      scripts.set(name, script as ScriptRef);
    }
  }

  return scripts;
}

/**
 * @todo optimize, currently on a hot path
 */
export function getVerbScripts(target: VerbTarget): ImmutableScriptMap {
  const scripts: ImmutableScriptMap = new Map();

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

export function mergeVerbScripts(target: ImmutableScriptMap, source: Immutable<ScriptMap>): void {
  for (const [name, script] of source) {
    if (name.startsWith(VERB_PREFIX)) {
      target.set(name, script);
    }
  }
}
