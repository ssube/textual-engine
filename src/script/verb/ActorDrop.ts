import { isNil, mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../error/ScriptTargetError';
import { isActor } from '../../model/entity/Actor';
import { isItem } from '../../model/entity/Item';
import { ScriptContext, ScriptTarget } from '../../service/script';
import { FUZZY_MATCHERS, indexEntity } from '../../util/entity';

export async function VerbActorDrop(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  const command = mustExist(context.command);
  const room = mustExist(context.room);

  const results = await context.state.find({
    actor: {
      id: this.meta.id,
    },
    meta: {
      name: command.target,
    },
    room: {
      id: room.meta.id,
    },
    matchers: FUZZY_MATCHERS,
  });

  const moving = indexEntity(results, command.index, isItem);
  if (isNil(moving)) {
    await context.state.show('actor.step.drop.type', { command });
    return;
  }

  await context.transfer.moveItem({
    moving,
    source: this,
    target: room,
  }, context);
}
