import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { assertItem } from '../../../util/script/assert.js';

export async function SignalItemStep(this: ScriptTarget, _context: ScriptContext): Promise<void> {
  assertItem(this);
}
