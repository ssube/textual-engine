import { mustExist } from '@apextoaster/js-utils';

import { ScriptScope, ScriptTarget } from '..';

export async function ItemUse(this: ScriptTarget, scope: ScriptScope): Promise<void> {
  const user = mustExist(scope.actor);

  scope.logger.debug(`${this.meta.name} has been used by ${user.meta.name}!`);
}