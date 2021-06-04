import { mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../error/ScriptTargetError';
import { isActor } from '../../model/entity/Actor';
import { isItem } from '../../model/entity/Item';
import { ScriptContext, ScriptTarget } from '../../service/script';
import { SLOT_USE } from '../../util/constants';
import { FUZZY_MATCHERS, indexEntity } from '../../util/entity';

export async function VerbActorUse(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  const command = mustExist(context.command);
  const room = mustExist(context.room);
  const results = await context.stateHelper.find({
    meta: {
      name: command.target,
    },
    room: {
      id: room.meta.id,
    },
    matchers: FUZZY_MATCHERS
  });
  const target = indexEntity(results, command.index, isItem);

  if (!isItem(target)) {
    await context.stateHelper.show('actor.step.use.type', { command });
    return;
  }

  await context.script.invoke(target, SLOT_USE, {
    ...context,
    actor: this,
  });
}
