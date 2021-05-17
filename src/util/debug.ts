import { State } from '../model/State';

export async function debugState(state: State): Promise<Array<string>> {
  const lines = [
    `state: ${state.config.world}`
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

export async function graphState(state: State): Promise<Array<string>> {
  function sanitize(input: string): string {
    return input.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  const lines = [
    'strict graph {',
  ];

  // add rooms as nodes
  lines.push(`  ${sanitize(state.focus.room)} [fillcolor=turquoise,style=filled];`);

  // add edges between rooms
  for (const room of state.rooms) {
    for (const portal of room.portals) {
      lines.push(`  ${sanitize(room.meta.id)} -- ${sanitize(portal.dest)} [label="${portal.sourceGroup} -> ${portal.name} -> ${portal.targetGroup}"];`);
    }
  }

  lines.push('}');

  return lines;
}
