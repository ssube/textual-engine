import { doesExist, mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { isRoom, ROOM_TYPE } from '../../../model/entity/Room';
import { ScriptContext, ScriptTarget } from '../../../service/script';
import { setKey } from '../../../util/collection/map';

export async function SignalRoomEnter(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isRoom(this)) {
    throw new ScriptTargetError('script target must be a room');
  }

  // if room has scene flag and actor does not
  const actor = mustExist(context.actor);
  const sceneKey = `scene-${this.meta.id}`;
  const sceneRoom = this.flags.get('scene');

  if (doesExist(sceneRoom) && actor.flags.has(sceneKey) === false) {
    // teleport actor to scene room
    const [target] = await context.state.find({
      meta: {
        id: sceneRoom,
      },
      type: ROOM_TYPE,
    });

    const room = mustExist(context.room);
    await context.state.move({
      moving: actor,
      source: room,
      target,
    }, context);

    const flags = setKey(actor.flags, sceneKey, 'shown');
    await context.state.update(actor, { flags });

    return context.state.show(context.source, 'signal.room.enter.scene', { actor, sceneKey });
  }
}

