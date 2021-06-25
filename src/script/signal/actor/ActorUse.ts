import { mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { isActor } from '../../../model/entity/Actor';
import { ScriptContext, ScriptTarget } from '../../../service/script';
import { getKey, incrementKey } from '../../../util/collection/map';
import { STAT_DAMAGE, STAT_HEALTH } from '../../../util/constants';

export async function SignalActorUse(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  const item = mustExist(context.item);

  const maxDamage = getKey(item.stats, STAT_DAMAGE, 0);
  const maxHealth = getKey(item.stats, STAT_HEALTH, 0);

  const damage = context.random.nextInt(maxDamage);
  const health = context.random.nextInt(maxHealth);
  const result = incrementKey(this.stats, STAT_HEALTH, health - damage);

  await context.state.show(context.source, 'actor.use.item.health', {
    actor: this,
    item,
    health: result,
  });
}
