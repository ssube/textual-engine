import { doesExist, isNil, mustExist, NotFoundError } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { ActorSource, isActor } from '../../../model/entity/Actor';
import { isPortal } from '../../../model/entity/Portal';
import { isRoom, ROOM_TYPE } from '../../../model/entity/Room';
import { ScriptContext, ScriptTarget } from '../../../service/script';
import { head } from '../../../util/collection/array';
import { getKey, setKey } from '../../../util/collection/map';
import { SIGNAL_LOOK, STAT_LOCKED } from '../../../util/constants';
import { indexEntity } from '../../../util/entity/match';

export async function VerbActorMove(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  // find the new room
  const command = mustExist(context.command);
  const targetName = head(command.targets);

  const currentRoom = mustExist(context.room);
  const portals = currentRoom.portals.filter((it) => {
    // TODO: use entity search helper
    const group = it.group.source.toLocaleLowerCase();
    const name = it.meta.name.toLocaleLowerCase();
    // portals in the same group usually lead to the same place, but name and group can both be ambiguous
    return (it.meta.id === targetName || name === targetName || group === targetName || `${group} ${name}` === targetName);
  });
  const targetPortal = indexEntity(portals, command.index, isPortal);

  if (isNil(targetPortal)) {
    return context.state.show(context.source, 'actor.step.move.missing', { command });
  }

  const locked = getKey(targetPortal.stats, STAT_LOCKED, 0);
  if (locked > 0) {
    return context.state.show(context.source, 'actor.step.move.locked', { command, portal: targetPortal });
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

  await context.state.show(context.source, 'actor.step.move.portal', {
    actor: this,
    portal: targetPortal,
  });

  // leader movement flags
  const pathKey = this.flags.get('leader');
  if (doesExist(pathKey)) {
    const flags = setKey(currentRoom.flags, pathKey, targetPortal.meta.id);
    await context.state.update(currentRoom, { flags });
  }

  // move the actor and focus
  await context.state.move({
    moving: this,
    source: currentRoom,
    target: targetRoom,
  }, context);

  if (this.source === ActorSource.PLAYER) {
    context.logger.debug({ actor: this, room: targetRoom }, 'player entered room');
    await context.script.invoke(targetRoom, SIGNAL_LOOK, context);
  }
}
