import { mustExist, Optional } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { Actor, ACTOR_TYPE, isActor } from '../../../model/entity/Actor';
import { isItem } from '../../../model/entity/Item';
import { ScriptContext, ScriptTarget } from '../../../service/script';
import { head } from '../../../util/collection/array';
import { SIGNAL_USE } from '../../../util/constants';
import { createFuzzyMatcher, indexEntity } from '../../../util/entity/match';

export async function VerbActorUse(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  const command = mustExist(context.command);
  const room = mustExist(context.room);
  const itemResults = await context.state.find({
    meta: {
      name: head(command.targets),
    },
    room: {
      id: room.meta.id,
    },
    matchers: createFuzzyMatcher(),
  });
  const item = indexEntity(itemResults, command.index, isItem);

  if (!isItem(item)) {
    await context.state.show(context.source, 'actor.step.use.type', { command });
    return;
  }

  const actor = await getUseTarget(this, context);
  if (!isActor(actor)) {
    await context.state.show(context.source, 'actor.step.use.target', { command });
    return;
  }

  await context.script.invoke(item, SIGNAL_USE, {
    ...context,
    actor,
  });
}

export async function getUseTarget(actor: Actor, context: ScriptContext): Promise<Optional<Actor>> {
  const command = mustExist(context.command);
  const room = mustExist(context.room);

  if (command.targets.length > 1) {
    const actorResults = await context.state.find<typeof ACTOR_TYPE>({
      matchers: createFuzzyMatcher(),
      meta: {
        name: head(command.targets),
      },
      room: {
        id: room.meta.id,
      },
      type: ACTOR_TYPE,
    });

    return actorResults[0];
  }

  return actor;
}
