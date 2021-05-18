import { mustExist } from '@apextoaster/js-utils';

import { ScriptScope, ScriptTarget } from '..';

export async function ItemUse(this: ScriptTarget, scope: ScriptScope): Promise<void> {
  const user = mustExist(scope.actor);

  await scope.focus.show(`${this.meta.name} has been used by ${user.meta.name}!`);
}
