import { ScriptTargetError } from '../../../error/ScriptTargetError.js';
import { isItem } from '../../../model/entity/Item.js';
import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';

export async function SignalItemStep(this: ScriptTarget, _context: ScriptContext): Promise<void> {
  if (!isItem(this)) {
    throw new ScriptTargetError('script target must be an item');
  }
}
