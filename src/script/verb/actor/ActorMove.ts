import { isNil, mustExist, NotFoundError } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { ActorSource, isActor } from '../../../model/entity/Actor';
import { isPortal } from '../../../model/entity/Portal';
import { isRoom, ROOM_TYPE } from '../../../model/entity/Room';
import { ScriptContext, ScriptTarget } from '../../../service/script';
import { ShowVolume } from '../../../util/actor';
import { VERB_LOOK } from '../../../util/constants';
import { indexEntity } from '../../../util/entity/match';

export async function VerbActorMove(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  // find the new room
  const command = mustExist(context.command);
  const targetName = command.target;

  const currentRoom = mustExist(context.room);
  const portals = currentRoom.portals.filter((it) => {
    // TODO: use entity search helper
    const group = it.groupSource.toLocaleLowerCase();
    const name = it.meta.name.toLocaleLowerCase();
    // portals in the same group usually lead to the same place, but name and group can both be ambiguous
    return (it.meta.id === targetName || name === targetName || group === targetName || `${group} ${name}` === targetName);
  });
  const targetPortal = indexEntity(portals, command.index, isPortal);

  if (isNil(targetPortal)) {
    await context.state.show('actor.step.move.missing', { command });
    return;
  }

  const rooms = await context.state.find({
    meta: {
      id: targetPortal.dest,
    },
    type: ROOM_TYPE,
  });
  const targetRoom = indexEntity(rooms, command.index, isRoom);

  if (!isRoom(targetRoom)) {
    context.logger.warn({ actor: this, command, rooms, targetPortal }, 'destination room not found');
    throw new NotFoundError('destination room not found');
  }

  // move the actor and focus
  await context.transfer.moveActor({
    moving: this,
    source: currentRoom,
    target: targetRoom,
  }, context);

  await context.state.show('actor.step.move.portal', {
    actor: this,
    portal: targetPortal,
  }, ShowVolume.SELF, {
    actor: this,
    room: currentRoom,
  });

  if (this.source === ActorSource.PLAYER) {
    context.logger.debug({ actor: this, room: targetRoom }, 'player entered room');
    await context.state.enter({ actor: this, room: targetRoom });
    await context.script.invoke(this, VERB_LOOK, context);
  }
}
