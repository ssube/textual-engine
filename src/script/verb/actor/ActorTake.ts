import { isNone, mustExist } from '@apextoaster/js-utils';

import { isItem, Item } from '../../../model/entity/Item.js';
import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { head } from '../../../util/collection/array.js';
import { createFuzzyMatcher, indexEntity } from '../../../util/entity/match.js';
import { assertActor } from '../../../util/script/assert.js';

export async function VerbActorTake(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const actor = assertActor(this);

  const command = mustExist(context.command);
  const room = mustExist(context.room);
  context.logger.debug({ command, room }, 'taking item from room');

  const valid = new Set(room.items.map((it) => it.meta.id));
  const matchers = createFuzzyMatcher();
  const results = await context.state.find({
    meta: {
      name: head(command.targets),
    },
    room: {
      id: room.meta.id,
    },
    matchers: {
      ...matchers,
      entity: (entity, search): entity is Item => {
        // exclude own and other's inventory items
        if (valid.has(entity.meta.id)) {
          return matchers.entity(entity, search);
        } else {
          return false;
        }
      },
    },
  });

  const moving = indexEntity(results, command.index, isItem);

  if (isNone(moving)) {
    return context.state.show(context.source, 'actor.verb.take.type', { command });
  }

  await context.state.move({
    moving,
    source: room,
    target: actor,
  }, context);
}
