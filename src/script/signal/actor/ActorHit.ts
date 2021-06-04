import { InvalidArgumentError, mustExist } from '@apextoaster/js-utils';

import { isActor } from '../../../model/entity/Actor';
import { ScriptContext, ScriptTarget } from '../../../service/script';
import { STAT_DAMAGE, STAT_HEALTH } from '../../../util/constants';
import { decrementKey, getKey } from '../../../util/collection/map';

export async function ActorHit(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new InvalidArgumentError('invalid entity type');
  }

  const attacker = mustExist(context.actor);
  const item = mustExist(context.item);

  await context.stateHelper.show('actor.hit.hit', {
    actor: this,
    attacker,
    item,
  });

  const maxDamage = getKey(item.stats, STAT_DAMAGE, 1) + getKey(attacker.stats, STAT_DAMAGE, 0);
  const damage = context.random.nextInt(maxDamage);

  const health = decrementKey(this.stats, STAT_HEALTH, damage);
  if (health > 0) {
    await context.stateHelper.show('actor.hit.health', { actor: this, health });
  } else {
    // drop inventory
    const room = mustExist(context.room);
    for (const dropItem of this.items) {
      await context.transfer.moveItem({
        moving: dropItem,
        source: this.meta.id,
        target: room.meta.id,
      }, context);
    }
    await context.stateHelper.show('actor.hit.dead', { actor: this });
  }
}