import { join } from 'path';
import { State } from '../model/State';
import { Loader } from '../service/loader';
import { Render } from '../service/render';

export async function debugState(render: Render, state: State): Promise<void> {
  await render.show(`state: ${state.config.world}`);

  for (const room of state.rooms) {
    await render.show(`  room: ${room.meta.name} (${room.meta.id})`);

    for (const actor of room.actors) {
      await render.show(`    actor: ${actor.meta.name} (${actor.meta.id}, ${actor.actorType})`);

      for (const item of actor.items) {
        await render.show(`      item: ${item.meta.name} (${item.meta.id})`);
      }
    }

    for (const item of room.items) {
      await render.show(`    item: ${item.meta.name} (${item.meta.id})`);
    }

    for (const portal of room.portals) {
      await render.show(`    portal: ${portal.name} (${portal.sourceGroup}) -> ${portal.dest} (${portal.targetGroup})`);
    }
  }
}

export async function graphState(loader: Loader, render: Render, state: State): Promise<void> {
  function sanitize(input: string): string {
    return input.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  const lines = [];

  lines.push('strict graph {');

  lines.push(`  ${sanitize(state.focus.room)} [fillcolor=turquoise,style=filled]`);

  for (const room of state.rooms) {
    for (const portal of room.portals) {
      lines.push(`  ${sanitize(room.meta.id)} -- ${sanitize(portal.dest)} [label="${portal.sourceGroup} -> ${portal.name} -> ${portal.targetGroup}"];`);
    }
  }

  lines.push('}');

  const path = join('out', 'debug-graph');
  const data = Buffer.from(lines.join('\n'));

  await loader.dump(path, data);
  await render.show(`wrote ${state.rooms.length} node graph to ${path}`);
}
