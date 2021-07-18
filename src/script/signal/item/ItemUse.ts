import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { isItem } from '../../../model/entity/Item';
import { ScriptContext, ScriptTarget } from '../../../service/script';

export async function SignalItemUse(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isItem(this)) {
    throw new ScriptTargetError('script target must be an item');
  }

  await context.state.show(context.source, 'item.use.any', { item: this });
}
