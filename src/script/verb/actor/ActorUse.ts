import { isNone, Maybe, mustExist } from '@apextoaster/js-utils';

import { ReadonlyActor } from '../../../model/entity/Actor.js';
import { WorldEntity } from '../../../model/entity/index.js';
import { isItem } from '../../../model/entity/Item.js';
import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { head } from '../../../util/collection/array.js';
import { SIGNAL_USE } from '../../../util/constants.js';
import { createFuzzyMatcher, indexEntity } from '../../../util/entity/match.js';
import { assertActor } from '../../../util/script/assert.js';
import { Immutable } from '../../../util/types.js';

export async function VerbActorUse(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const actor = assertActor(this);

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
    return context.state.show(context.source, 'actor.verb.use.type', { command });
  }

  const target = await getUseTarget(actor, context);
  if (isNone(target)) {
    return context.state.show(context.source, 'actor.verb.use.target', { command });
  }

  await context.script.invoke(target, SIGNAL_USE, {
    ...context,
    item,
  });
}

export async function getUseTarget(actor: ReadonlyActor, context: ScriptContext): Promise<Maybe<Immutable<WorldEntity>>> {
  const command = mustExist(context.command);
  const room = mustExist(context.room);

  if (command.targets.length > 1) {
    const actorResults = await context.state.find({
      matchers: createFuzzyMatcher(),
      meta: {
        name: command.targets[1],
      },
      room: {
        id: room.meta.id,
      },
    });

    return actorResults[0];
  }

  return actor;
}
