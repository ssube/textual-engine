import { mustExist } from '@apextoaster/js-utils';

import { makeCommand } from '../../../../model/Command.js';
import { ScriptContext, ScriptTarget } from '../../../../service/script/index.js';
import { VERB_MOVE, VERB_WAIT } from '../../../../util/constants.js';
import { assertActor } from '../../../../util/script/assert.js';
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
  const actor = assertActor(this);

  const behavior = context.random.nextFloat();
  context.logger.debug({ behavior }, 'received room event from state');

  const room = mustExist(context.room);
  if (matchIdSegments(room.meta.id, 'intro-quincey') && context.step.turn > 10) {
    return context.behavior.queue(actor, makeCommand(VERB_MOVE));
  }

  // if in the hallway with player, greet and move to Lucy
  // if with Lucy and player, give her blood

  return context.behavior.queue(actor, makeCommand(VERB_WAIT));
}
