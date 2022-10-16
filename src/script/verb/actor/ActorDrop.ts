import { isNone, mustExist } from '@apextoaster/js-utils';

import { isItem } from '../../../model/entity/Item.js';
import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { head } from '../../../util/collection/array.js';
import { createFuzzyMatcher, indexEntity } from '../../../util/entity/match.js';
import { assertActor } from '../../../util/script/assert.js';

export async function VerbActorDrop(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const actor = assertActor(this);

  const command = mustExist(context.command);
  const room = mustExist(context.room);

  const results = await context.state.find({
    actor: {
      id: actor.meta.id,
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
  if (isNone(moving)) {
    return context.state.show(context.source, 'actor.verb.drop.type', { command });
  }

  if (actor.items.includes(moving) === false) {
    return context.state.show(context.source, 'actor.verb.drop.owner', { command, item: moving });
  }

  return context.state.move({
    moving,
    source: actor,
    target: room,
  }, context);
}
