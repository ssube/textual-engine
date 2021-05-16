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

  const health = decrementKey(this.stats, 'health');
  await scope.render.show(`${attacker.meta.name} has hit ${this.meta.name} with a ${item.meta.name}!`);
  await scope.render.show(`${this.meta.name} has ${health} health left`);
}
