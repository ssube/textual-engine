import { doesExist } from '@apextoaster/js-utils';

import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { assertItem } from '../../../util/script/assert.js';

export async function SignalItemLook(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const item = assertItem(this);

  if (doesExist(context.actor) && context.actor.items.includes(item)) {
    await context.state.show(context.source, 'item.signal.look.held', { item });
  } else {
    await context.state.show(context.source, 'item.signal.look.seen', { item });
  }
}
