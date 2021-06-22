import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { WorldEntity } from '../../../model/entity';
import { isRoom } from '../../../model/entity/Room';
import { ScriptContext } from '../../../service/script';
import { SIGNAL_LOOK } from '../../../util/constants';

export async function SignalRoomLook(this: WorldEntity, context: ScriptContext): Promise<void> {
  if (!isRoom(this)) {
    throw new ScriptTargetError('target must be a room');
  }

  await context.state.show(context.source, 'actor.step.look.room.seen', { room: this });

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
