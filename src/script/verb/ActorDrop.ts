import { isNil, mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../error/ScriptTargetError';
import { isActor } from '../../model/entity/Actor';
import { isItem } from '../../model/entity/Item';
import { ScriptContext, ScriptTarget } from '../../service/script';
import { FUZZY_MATCHERS, indexEntity } from '../../util/entity';
import { searchState } from '../../util/state';

export async function VerbActorDrop(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  const command = mustExist(context.command);
  const room = mustExist(context.room);

  const results = searchState(context.state, {
    actor: {
      id: this.meta.id,
    },
    meta: {
      name: command.target,
    },
    room: {
      id: room.meta.id,
    },
  }, FUZZY_MATCHERS);

  const moving = indexEntity(results, command.index, isItem);
  if (isNil(moving)) {
    await context.stateHelper.show('actor.step.drop.type', { command });
    return;
  }

  await context.transfer.moveItem({
    moving,
    source: this.meta.id,
    target: room.meta.id,
  }, context);
}
