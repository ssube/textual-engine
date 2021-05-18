import { mustExist } from '@apextoaster/js-utils';

import { ScriptContext, ScriptTarget } from '..';

export async function ItemUse(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const user = mustExist(context.actor);

  await context.focus.show(`${this.meta.name} has been used by ${user.meta.name}!`);
}
