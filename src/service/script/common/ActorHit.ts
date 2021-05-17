import { InvalidArgumentError, mustExist } from '@apextoaster/js-utils';

import { ScriptScope, ScriptTarget } from '..';
import { isActor } from '../../../model/entity/Actor';
import { decrementKey } from '../../../util/map';

export async function ActorHit(this: ScriptTarget, scope: ScriptScope): Promise<void> {
  if (!isActor(this)) {
    throw new InvalidArgumentError('invalid entity type');
  }

  const attacker = mustExist(scope.actor);
  const item = mustExist(scope.item);

  await scope.focus.show(`${attacker.meta.name} has hit ${this.meta.name} (${this.meta.id}) with a ${item.meta.name}!`);

  const health = decrementKey(this.stats, 'health');
  if (health > 0) {
    await scope.focus.show(`${this.meta.name} has ${health} health left`);
  } else {
    await scope.focus.show(`${this.meta.name} has died!`);
  }
}
