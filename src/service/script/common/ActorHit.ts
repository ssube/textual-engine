import { mustExist } from '@apextoaster/js-utils';

import { ScriptScope, ScriptTarget } from '..';

export async function ActorHit(this: ScriptTarget, scope: ScriptScope): Promise<void> {
  const attacker = mustExist(scope.actor);
  const item = mustExist(scope.item);

  scope.logger.debug(`${this.meta.name} has been hit by ${attacker.meta.name} with the ${item.meta.name}!`);
}
