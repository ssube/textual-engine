import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { SIGNAL_LOOK } from '../../../util/constants.js';
import { assertRoom } from '../../../util/script/assert.js';

export async function SignalRoomLook(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const room = assertRoom(this);

  await context.state.show(context.source, 'room.signal.look.seen', { room });

  for (const actor of room.actors) {
    if (actor === context.actor) {
      continue;
    }

    await context.script.invoke(actor, SIGNAL_LOOK, context);
  }

  for (const item of room.items) {
    await context.script.invoke(item, SIGNAL_LOOK, context);
  }

  for (const portal of room.portals) {
    await context.script.invoke(portal, SIGNAL_LOOK, context);
  }
}
