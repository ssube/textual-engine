import { ScriptTargetError } from '../../../../error/ScriptTargetError';
import { WorldEntity } from '../../../../model/entity';
import { isActor } from '../../../../model/entity/Actor';
import { ScriptContext } from '../../../../service/script';
import { getKey } from '../../../../util/collection/map';
import { STAT_HEALTH } from '../../../../util/constants';

/**
 * Looking at the character of Lucy should:
 *
 * - note her condition
 */
export async function SignalActorLookLucy(this: WorldEntity, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  await context.state.show(context.source, 'actor.signal.look.seen', { actor: this });

  const health = getKey(this.stats, STAT_HEALTH, 0);
  switch (true) {
    case (health <= 0):
      return context.state.show(context.source, 'actor.signal.look.dead', { actor: this });
    case (health <= 10):
      return context.state.show(context.source, 'actor.signal.look.pale', { actor: this });
    default:
      return context.state.show(context.source, 'actor.signal.look.healthy', { actor: this });
  }
}
