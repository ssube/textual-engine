import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { WorldEntity } from '../../../model/entity';
import { isPortal } from '../../../model/entity/Portal';
import { ROOM_TYPE } from '../../../model/entity/Room';
import { ScriptContext } from '../../../service/script';

export async function SignalPortalLook(this: WorldEntity, context: ScriptContext): Promise<void> {
  if (!isPortal(this)) {
    throw new ScriptTargetError('script target must be a portal');
  }

  await context.state.show(context.source, 'actor.step.look.room.portal', { portal: this });

  if (this.dest.length > 0) {
    const [room] = await context.state.find({
      meta: {
        id: this.dest,
      },
      type: ROOM_TYPE,
    });

    await context.state.show(context.source, 'actor.step.look.room.dest', { portal: this, room });
  }
}
