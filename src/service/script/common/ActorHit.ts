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

  await context.focus.show(`${attacker.meta.name} has hit ${this.meta.name} (${this.meta.id}) with a ${item.meta.name}!`);

  const health = decrementKey(this.stats, 'health');
  if (health > 0) {
    await context.focus.show(`${this.meta.name} has ${health} health left`);
  } else {
    await context.focus.show(`${this.meta.name} has died!`);
  }
}
