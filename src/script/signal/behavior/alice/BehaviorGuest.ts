import { doesExist, mustExist } from '@apextoaster/js-utils';
import { ScriptTargetError } from '../../../../error/ScriptTargetError';
import { makeCommand } from '../../../../model/Command';
import { ActorSource, isActor } from '../../../../model/entity/Actor';
import { ScriptContext, ScriptTarget } from '../../../../service/script';
import { randomItem } from '../../../../util/collection/array';
import { getKey } from '../../../../util/collection/map';
import { VERB_HIT, VERB_MOVE, VERB_WAIT } from '../../../../util/constants';

/**
 * The guests in the Queen's croquet party should:
 *
 * - follow the queen to the croquet ground
 * - play croquet once on the grounds
 * - gather around the Cheshire Cat
 */
export async function SignalBehaviorAliceGuest(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('target must be an actor');
  }

  const behavior = context.random.nextFloat();
  context.logger.debug({ behavior }, 'received room event from state');

  const room = mustExist(context.room);

  // TODO: behavior
}
