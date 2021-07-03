import { isNil, mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { isActor } from '../../../model/entity/Actor';
import { isItem } from '../../../model/entity/Item';
import { ScriptContext, ScriptTarget } from '../../../service/script';
import { head } from '../../../util/collection/array';
import { createFuzzyMatcher, indexEntity } from '../../../util/entity/match';

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
      name: head(command.targets),
    },
    room: {
      id: room.meta.id,
    },
    matchers: createFuzzyMatcher(),
  });

  const moving = indexEntity(results, command.index, isItem);
  if (isNil(moving)) {
    await context.state.show(context.source, 'actor.step.drop.type', { command });
    return;
  }

  await context.state.move({
    moving,
    source: this,
    target: room,
  }, context);
}
