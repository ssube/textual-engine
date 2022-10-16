import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { assertItem } from '../../../util/script/assert.js';

export async function SignalItemUse(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const item = assertItem(this);

  await context.state.show(context.source, 'item.use.any', { item });
}
