import { mustExist } from '@apextoaster/js-utils';

import { ScriptContext, ScriptTarget } from '../../../service/script';

export async function ItemUse(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const actor = mustExist(context.actor);

  await context.stateHelper.show('item.use.any', { actor, item: this });
}
