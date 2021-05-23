import { InvalidArgumentError, mustExist } from '@apextoaster/js-utils';

import { ScriptContext, ScriptTarget } from '..';
import { isActor } from '../../../model/entity/Actor';
import { decrementKey } from '../../../util/map';

export async function ActorHit(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new InvalidArgumentError('invalid entity type');
  }

  const attacker = mustExist(context.actor);
  const item = mustExist(context.item);

  await context.focus.show('actor.hit.hit', {
    actor: this,
    attacker,
    item,
  });

  const health = decrementKey(this.stats, 'health');
  if (health > 0) {
    await context.focus.show('actor.hit.health', { actor: this, health });
  } else {
    await context.focus.show('actor.hit.dead', { actor: this });
  }
}
