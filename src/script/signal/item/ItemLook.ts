import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { WorldEntity } from '../../../model/entity';
import { isItem } from '../../../model/entity/Item';
import { ScriptContext } from '../../../service/script';

export async function SignalItemLook(this: WorldEntity, context: ScriptContext): Promise<void> {
  if (!isItem(this)) {
    throw new ScriptTargetError('target must be an item');
  }

  await context.state.show('actor.step.look.item.seen', { item: this });
}
