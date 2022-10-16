import { WorldEntity } from '../../../../model/entity/index.js';
import { ScriptContext } from '../../../../service/script/index.js';
import { getKey } from '../../../../util/collection/map.js';
import { STAT_HEALTH } from '../../../../util/constants.js';
import { assertActor } from '../../../../util/script/assert.js';

/**
 * Looking at the character of Lucy should:
 *
 * - note her condition
 */
export async function SignalActorLookLucy(this: WorldEntity, context: ScriptContext): Promise<void> {
  const actor = assertActor(this);

  await context.state.show(context.source, 'actor.signal.look.seen', { actor });

  const health = getKey(actor.stats, STAT_HEALTH, 0);
  switch (true) {
    case (health <= 0):
      return context.state.show(context.source, 'actor.signal.look.dead', { actor });
    case (health <= 10):
      return context.state.show(context.source, 'actor.signal.look.pale', { actor });
    default:
      return context.state.show(context.source, 'actor.signal.look.healthy', { actor });
  }
}
