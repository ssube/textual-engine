import { doesExist, isNone, mustExist, NotFoundError } from '@apextoaster/js-utils';

import { ActorSource } from '../../../model/entity/Actor.js';
import { isPortal } from '../../../model/entity/Portal.js';
import { isRoom, ROOM_TYPE } from '../../../model/entity/Room.js';
import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { head } from '../../../util/collection/array.js';
import { setKey } from '../../../util/collection/map.js';
import { SIGNAL_LOOK } from '../../../util/constants.js';
import { getPortalStats } from '../../../util/entity/index.js';
import { indexEntity } from '../../../util/entity/match.js';
import { assertActor } from '../../../util/script/assert.js';

export async function VerbActorMove(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const actor = assertActor(this);

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

  if (isNone(targetPortal)) {
    return context.state.show(context.source, 'actor.verb.move.missing', { command });
  }

  const { locked } = getPortalStats(targetPortal);
  if (locked) {
    return context.state.show(context.source, 'actor.verb.move.locked', { command, portal: targetPortal });
  }

  const rooms = await context.state.find({
    meta: {
      id: targetPortal.dest,
    },
    type: ROOM_TYPE,
  });
  const targetRoom = indexEntity(rooms, command.index, isRoom);

  if (!isRoom(targetRoom)) {
    context.logger.warn({ actor, command, rooms, targetPortal }, 'destination room not found');
    throw new NotFoundError('destination room not found');
  }

  await context.state.show(context.source, 'actor.verb.move.portal', {
    actor,
    portal: targetPortal,
  });

  // leader movement flags
  const pathKey = actor.flags.get('leader');
  if (doesExist(pathKey)) {
    const flags = setKey(currentRoom.flags, pathKey, targetPortal.meta.id);
    await context.state.update(currentRoom, { flags });
  }

  // move the actor and focus
  await context.state.move({
    moving: actor,
    source: currentRoom,
    target: targetRoom,
  }, context);

  if (actor.source === ActorSource.PLAYER) {
    context.logger.debug({ actor, room: targetRoom }, 'player entered room');
    await context.script.invoke(targetRoom, SIGNAL_LOOK, context);
  }
}
