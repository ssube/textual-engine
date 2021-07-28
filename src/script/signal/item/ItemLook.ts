import { doesExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError.js';
import { isItem } from '../../../model/entity/Item.js';
import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';

export async function SignalItemLook(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isItem(this)) {
    throw new ScriptTargetError('script target must be an item');
  }

  if (doesExist(context.actor) && context.actor.items.includes(this)) {
    await context.state.show(context.source, 'item.signal.look.held', { item: this });
  } else {
    await context.state.show(context.source, 'item.signal.look.seen', { item: this });
  }
}
