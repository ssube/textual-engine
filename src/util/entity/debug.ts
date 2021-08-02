import { WorldState } from '../../model/world/State.js';
import { hasText } from '../string.js';

export function debugState(state: WorldState): Array<string> {
  const lines = [
    `state: ${state.meta.id}`
  ];

  for (const room of state.rooms) {
    lines.push(`  room: ${room.meta.name} (${room.meta.id})`);

    for (const actor of room.actors) {
      lines.push(`    actor: ${actor.meta.name} (${actor.meta.id}, ${actor.source})`);

      for (const item of actor.items) {
        lines.push(`      item: ${item.meta.name} (${item.meta.id})`);
      }
    }

    for (const item of room.items) {
      lines.push(`    item: ${item.meta.name} (${item.meta.id})`);
    }

    for (const portal of room.portals) {
      lines.push(`    portal: ${portal.meta.name} (${portal.group.source}) -> ${portal.dest} (${portal.group.target})`);
    }
  }

  return lines;
}

export function graphState(state: WorldState): Array<string> {
  let unlinked = 0;
  function sanitize(input: string): string {
    if (hasText(input)) {
      return input.replace(/[^a-zA-Z0-9_]/g, '_');
    } else {
      const id = `unlinked_${unlinked}`;
      unlinked += 1;
      return id;
    }
  }

  const lines = [
    'strict digraph {',
  ];

  // add rooms as nodes
  lines.push(`  ${sanitize(state.start.room)} [fillcolor=turquoise,style=filled];`);

  // add edges between rooms
  for (const room of state.rooms) {
    for (const portal of room.portals) {
      const segments = [
        `  ${sanitize(room.meta.id)} -> ${sanitize(portal.dest)}`,
        '[',
        `label="${portal.group.source} ${portal.meta.name}"`,
        '];'
      ];

      lines.push(segments.join(' '));
    }
  }

  lines.push('}');

  return lines;
}
