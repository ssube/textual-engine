import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { isItem } from '../../../model/entity/Item';
import { ScriptContext, ScriptTarget } from '../../../service/script';

export async function SignalItemStep(this: ScriptTarget, _context: ScriptContext): Promise<void> {
  if (!isItem(this)) {
    throw new ScriptTargetError('script target must be an item');
  }
}
