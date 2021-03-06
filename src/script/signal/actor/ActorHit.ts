import { mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { isActor } from '../../../model/entity/Actor';
import { ScriptContext, ScriptTarget } from '../../../service/script';
import { decrementKey, getKey } from '../../../util/collection/map';
import { STAT_DAMAGE, STAT_HEALTH } from '../../../util/constants';

export async function SignalActorHit(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  const attacker = mustExist(context.actor);
  const item = mustExist(context.item);

  await context.state.show(context.source, 'actor.signal.hit.item', {
    actor: this,
    attacker,
    item,
  });

  const maxDamage = getKey(item.stats, STAT_DAMAGE, 1) + getKey(attacker.stats, STAT_DAMAGE, 0);
  const damage = context.random.nextInt(maxDamage);

  const [stats, health] = decrementKey(this.stats, STAT_HEALTH, damage);
  await context.state.update(this, { stats });

  if (health > 0) {
    await context.state.show(context.source, 'actor.signal.hit.health', { actor: this, damage, health });
  } else {
    // drop inventory
    const room = mustExist(context.room);
    for (const dropItem of this.items) {
      await context.state.move({
        moving: dropItem,
        source: this,
        target: room,
      }, context);
    }
    await context.state.show(context.source, 'actor.signal.hit.dead', { actor: this, damage });
  }
}
