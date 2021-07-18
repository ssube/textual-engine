import { ScriptTargetError } from '../../../../error/ScriptTargetError';
import { isActor } from '../../../../model/entity/Actor';
import { ScriptContext, ScriptTarget } from '../../../../service/script';
import { getKey } from '../../../../util/collection/map';

/**
 * The maids should:
 *
 * - start asleep
 * - wake up after a few turns
 */
export async function SignalActorLookMaid(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('target must be an actor');
  }

  const behavior = context.random.nextFloat();
  context.logger.debug({ behavior }, 'received room event from state');

  const turn = getKey(this.stats, 'awaken', 10);
  if (context.step.turn <= turn) {
    return context.state.show(context.source, 'actor.signal.look.asleep', { actor: this });
  } else {
    return context.state.show(context.source, 'actor.signal.look.awake', { actor: this });
  }
}
