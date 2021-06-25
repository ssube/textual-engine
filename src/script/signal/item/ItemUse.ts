import { mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { isItem } from '../../../model/entity/Item';
import { isPortal } from '../../../model/entity/Portal';
import { ScriptContext, ScriptTarget } from '../../../service/script';

export async function SignalItemUse(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isItem(this)) {
    throw new ScriptTargetError('script target must be an item');
  }

  const item = mustExist(context.item);

  if (isPortal(item)) {
    // unlock
  }

  await context.state.show(context.source, 'item.use.any', { item });
}
