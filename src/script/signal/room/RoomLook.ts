import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { isRoom } from '../../../model/entity/Room';
import { ScriptContext, ScriptTarget } from '../../../service/script';
import { SIGNAL_LOOK } from '../../../util/constants';

export async function SignalRoomLook(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isRoom(this)) {
    throw new ScriptTargetError('script target must be a room');
  }

  await context.state.show(context.source, 'room.signal.look.seen', { room: this });

  for (const actor of this.actors) {
    if (actor === context.actor) {
      continue;
    }

    await context.script.invoke(actor, SIGNAL_LOOK, context);
  }

  for (const item of this.items) {
    await context.script.invoke(item, SIGNAL_LOOK, context);
  }

  for (const portal of this.portals) {
    await context.script.invoke(portal, SIGNAL_LOOK, context);
  }
}
