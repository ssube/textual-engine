import { isNil, mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../error/ScriptTargetError';
import { isActor } from '../../model/entity/Actor';
import { isItem, Item } from '../../model/entity/Item';
import { ScriptContext, ScriptTarget } from '../../service/script';
import { createFuzzyMatcher, indexEntity } from '../../util/entity';

export async function VerbActorTake(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  const command = mustExist(context.command);
  const room = mustExist(context.room);
  context.logger.debug({ command, room }, 'taking item from room');

  const valid = new Set(room.items.map((it) => it.meta.id));
  const matchers = createFuzzyMatcher();
  const results = await context.state.find({
    meta: {
      name: command.target,
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

  if (isNil(moving)) {
    await context.state.show('actor.step.take.type', { command });
    return;
  }

  await context.transfer.moveItem({
    moving,
    source: room,
    target: this
  }, context);
}
