import { ScriptContext, ScriptTarget } from '../../../../service/script/index.js';
import { getKey } from '../../../../util/collection/map.js';
import { assertActor } from '../../../../util/script/assert.js';

/**
 * The maids should:
 *
 * - start asleep
 * - wake up after a few turns
 */
export async function SignalActorLookMaid(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const actor = assertActor(this);

  const behavior = context.random.nextFloat();
  context.logger.debug({ behavior }, 'received room event from state');

  const turn = getKey(actor.stats, 'awaken', 10);
  if (context.step.turn <= turn) {
    return context.state.show(context.source, 'actor.signal.look.asleep', { actor });
  } else {
    return context.state.show(context.source, 'actor.signal.look.awake', { actor });
  }
}
