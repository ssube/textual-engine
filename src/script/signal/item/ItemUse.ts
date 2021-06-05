import { mustExist } from '@apextoaster/js-utils';

import { ScriptContext, ScriptTarget } from '../../../service/script';

export async function SignalItemUse(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const actor = mustExist(context.actor);

  await context.state.show('item.use.any', { actor, item: this });
}
