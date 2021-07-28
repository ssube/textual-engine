import { mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../../error/ScriptTargetError.js';
import { makeCommand } from '../../../../model/Command.js';
import { isActor } from '../../../../model/entity/Actor.js';
import { ScriptContext, ScriptTarget } from '../../../../service/script/index.js';
import { VERB_MOVE, VERB_WAIT } from '../../../../util/constants.js';
import { matchIdSegments } from '../../../../util/string.js';

/**
 * The character of Quincey Morris should:
 *
 * - move into the hallway on the Nth turn
 * - greet the player if they enter the hallway
 * - follow the player to lucy
 * - give blood to Lucy
 */
export async function SignalBehaviorDraculaQuincey(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('target must be an actor');
  }

  const behavior = context.random.nextFloat();
  context.logger.debug({ behavior }, 'received room event from state');

  const room = mustExist(context.room);
  if (matchIdSegments(room.meta.id, 'intro-quincey') && context.step.turn > 10) {
    return context.behavior.queue(this, makeCommand(VERB_MOVE));
  }

  // if in the hallway with player, greet and move to Lucy
  // if with Lucy and player, give her blood

  return context.behavior.queue(this, makeCommand(VERB_WAIT));
}
