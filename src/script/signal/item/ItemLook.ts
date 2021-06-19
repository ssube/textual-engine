import { mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { WorldEntity } from '../../../model/entity';
import { isActor } from '../../../model/entity/Actor';
import { ScriptContext } from '../../../service/script';

export async function SignalItemLook(this: WorldEntity, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('target must be actor');
  }

  const item = mustExist(context.item);
  await context.state.show('actor.step.look.item.seen', { item });
}
