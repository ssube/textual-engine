import { mustExist } from '@apextoaster/js-utils';

import { ScriptContext, ScriptTarget } from '..';

export async function ItemUse(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const actor = mustExist(context.actor);

  await context.focus.show('item.use.any', { actor, item: this });
}
