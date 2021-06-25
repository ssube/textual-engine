import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { isItem } from '../../../model/entity/Item';
import { ScriptContext, ScriptTarget } from '../../../service/script';

export async function SignalItemStep(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isItem(this)) {
    throw new ScriptTargetError('script target must be an item');
  }

  context.logger.debug({
    meta: this.meta,
    scope: Object.keys(context),
  }, 'item step script');
}
