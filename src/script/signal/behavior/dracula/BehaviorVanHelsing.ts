import { doesExist, mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../../error/ScriptTargetError';
import { makeCommand } from '../../../../model/Command';
import { ACTOR_TYPE, ActorSource, isActor } from '../../../../model/entity/Actor';
import { ScriptContext, ScriptTarget } from '../../../../service/script';
import { VERB_MOVE, VERB_WAIT } from '../../../../util/constants';
import { matchIdSegments } from '../../../../util/string';

/**
 * The character of Van Helsing should:
 *
 * - appear on the Nth turn
 * - move to the back of the house
 * - give the saw to the player
 * - move to Lucy's room
 * - teleport into the living room with Lucy
 * - give the note to the player
 */
// eslint-disable-next-line complexity
export async function SignalBehaviorDraculaVanHelsing(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('target must be an actor');
  }

  const room = mustExist(context.room);
  const actors = await context.state.find({
    room: {
      id: room.meta.id,
    },
    type: ACTOR_TYPE,
  });

  const player = actors.find((it) => it.source === ActorSource.PLAYER);

  if (doesExist(player) && matchIdSegments(room.meta.id, 'room-gate')) {
    context.logger.debug({ actor: this }, 'intro trigger');
  }

  if (doesExist(player) && matchIdSegments(room.meta.id, 'room-house-back')) {
    context.logger.debug({ actor: this }, 'back of house trigger');
  }

  if (doesExist(player) && matchIdSegments(room.meta.id, 'room-house-dining')) {
    context.logger.debug({ actor: this }, 'dining room trigger');
  }

  if (doesExist(player) && matchIdSegments(room.meta.id, 'room-house-lucy')) {
    context.logger.debug({ actor: this }, 'Lucy\'s bedroom trigger');
  }

  // TODO: follow VH path
  const path = room.flags.get('path-van-helsing');
  if (doesExist(path)) {
    context.logger.debug({ actor: this }, 'following VH path');
    return context.behavior.queue(this, makeCommand(VERB_MOVE, path));
  }

  return context.behavior.queue(this, makeCommand(VERB_WAIT));
}
