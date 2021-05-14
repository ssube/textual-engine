import { State } from '../model/State';
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
      await render.show(`    portal: ${portal.name} -> ${portal.dest}`);
    }
  }
}