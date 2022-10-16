import { mustExist } from '@apextoaster/js-utils';

import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { decrementKey, getKey } from '../../../util/collection/map.js';
import { STAT_DAMAGE, STAT_HEALTH } from '../../../util/constants.js';
import { assertActor } from '../../../util/script/assert.js';

export async function SignalActorHit(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const actor = assertActor(this);

  const attacker = mustExist(context.actor);
  const item = mustExist(context.item);

  await context.state.show(context.source, 'actor.signal.hit.item', {
    actor,
    attacker,
    item,
  });

  const maxDamage = getKey(item.stats, STAT_DAMAGE, 1) + getKey(attacker.stats, STAT_DAMAGE, 0);
  const damage = context.random.nextInt(maxDamage);

  const [stats, health] = decrementKey(actor.stats, STAT_HEALTH, damage);
  await context.state.update(actor, { stats });

  if (health > 0) {
    await context.state.show(context.source, 'actor.signal.hit.health', { actor, damage, health });
  } else {
    // drop inventory
    const room = mustExist(context.room);
    for (const dropItem of actor.items) {
      await context.state.move({
        moving: dropItem,
        source: actor,
        target: room,
      }, context);
    }
    await context.state.show(context.source, 'actor.signal.hit.dead', { actor, damage });
  }
}
