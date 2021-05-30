import { WorldState } from '../../model/world/State';

/**
 * @todo return key/context pairs
 */
export function debugState(state: WorldState): Array<string> {
  const lines = [
    `state: ${state.meta.id}`
  ];

  for (const room of state.rooms) {
    lines.push(`  room: ${room.meta.name} (${room.meta.id})`);

    for (const actor of room.actors) {
      lines.push(`    actor: ${actor.meta.name} (${actor.meta.id}, ${actor.actorType})`);

      for (const item of actor.items) {
        lines.push(`      item: ${item.meta.name} (${item.meta.id})`);
      }
    }

    for (const item of room.items) {
      lines.push(`    item: ${item.meta.name} (${item.meta.id})`);
    }

    for (const portal of room.portals) {
      lines.push(`    portal: ${portal.name} (${portal.sourceGroup}) -> ${portal.dest} (${portal.targetGroup})`);
    }
  }

  return lines;
}

/**
 * @todo return key/context pairs
 */
export function graphState(state: WorldState): Array<string> {
  function sanitize(input: string): string {
    return input.replace(/[^a-zA-Z0-9_]/g, '_');
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
        `label="${portal.sourceGroup} ${portal.name}"`,
      ];

      segments.push('];');
      lines.push(segments.join(' '));
    }
  }

  lines.push('}');

  return lines;
}
