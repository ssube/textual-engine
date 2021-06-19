import { mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { WorldEntity } from '../../../model/entity';
import { isActor } from '../../../model/entity/Actor';
import { ROOM_TYPE } from '../../../model/entity/Room';
import { ScriptContext } from '../../../service/script';

export async function SignalPortalLook(this: WorldEntity, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('target must be actor');
  }

  const portal = mustExist(context.portal);
  await context.state.show('actor.step.look.room.portal', { portal });

  if (portal.dest.length > 0) {
    const [room] = await context.state.find({
      meta: {
        id: portal.dest,
      },
      type: ROOM_TYPE,
    });

    await context.state.show('actor.step.look.room.dest', { portal, room });
  }
}
