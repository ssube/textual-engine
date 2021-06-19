import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { WorldEntity } from '../../../model/entity';
import { isActor } from '../../../model/entity/Actor';
import { ScriptContext } from '../../../service/script';
import { getKey } from '../../../util/collection/map';
import { STAT_HEALTH } from '../../../util/constants';

export async function SignalActorLook(this: WorldEntity, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('target must be an actor');
  }

  await context.state.show('actor.step.look.actor.seen', { actor: this });
  const health = getKey(this.stats, STAT_HEALTH, 0);
  if (health <= 0) {
    await context.state.show('actor.step.look.actor.dead', { actor: this });
  }
}
