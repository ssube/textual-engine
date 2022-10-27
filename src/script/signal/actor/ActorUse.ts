import { mustExist } from '@apextoaster/js-utils';

import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { getKey, incrementKey } from '../../../util/collection/map.js';
import { STAT_DAMAGE, STAT_HEALTH } from '../../../util/constants.js';
import { assertActor } from '../../../util/script/assert.js';

export async function SignalActorUse(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const actor = assertActor(this);
  const item = mustExist(context.item);

  let change = 0;

  if (item.stats.has(STAT_DAMAGE)) {
    const maxDamage = getKey(item.stats, STAT_DAMAGE, 1);
    const damageRoll = context.random.nextInt(maxDamage, 1);
    change -= damageRoll;
  }

  if (item.stats.has(STAT_HEALTH)) {
    const maxHealth = getKey(item.stats, STAT_HEALTH, 1);
    const healthRoll = context.random.nextInt(maxHealth, 1);
    change += healthRoll;
  }

  const [stats, health] = incrementKey(actor.stats, STAT_HEALTH, change);

  await context.state.update(actor, { stats });

  await context.state.show(context.source, 'actor.use.item.health', {
    actor,
    item,
    health,
  });
}
