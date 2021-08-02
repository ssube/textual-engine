import { ShortcutData, ShortcutItem, StatusItem } from '../../component/shared.js';
import { Entity } from '../../model/entity/Base.js';
import { ActorRoomEvent } from '../../service/actor/events.js';
import { remove } from '../collection/array.js';
import { COMMON_STATS } from '../constants.js';
import { getVerbScripts } from '../script/index.js';

export function extractShortcut(entity: Entity): ShortcutItem {
  return {
    id: entity.meta.id,
    name: entity.meta.name,
  };
}

export function getEventShortcuts(event: ActorRoomEvent, filterStats = COMMON_STATS): { shortcuts: ShortcutData; stats: Array<StatusItem> } {
  const actors = remove(event.room.actors, (it) => it.meta.id === event.pid).map(extractShortcut);
  const items = event.room.items.map(extractShortcut);
  const portals = event.room.portals.map((it) => ({
    id: it.meta.id,
    name: `${it.group.source} ${it.meta.name}`,
  }));

  const scripts = getVerbScripts(event);
  const verbs = Array.from(scripts.keys()).map((it) => ({
    id: it,
    name: it,
  }));

  const stats = Array.from(event.actor.stats.entries()).filter((it) => filterStats.includes(it[0])).map((it) => ({
    name: it[0],
    value: it[1],
  }));

  return {
    shortcuts: {
      actors,
      items,
      portals,
      verbs,
    },
    stats,
  };
}
