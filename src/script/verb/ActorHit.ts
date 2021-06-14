import { isNil, mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../error/ScriptTargetError';
import { isActor } from '../../model/entity/Actor';
import { ScriptContext, ScriptTarget } from '../../service/script';
import { ShowVolume } from '../../util/actor';
import { SIGNAL_HIT } from '../../util/constants';
import { createFuzzyMatcher, indexEntity } from '../../util/entity';

export async function VerbActorHit(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  const command = mustExist(context.command);
  const room = mustExist(context.room);

  const results = await context.state.find({
    meta: {
      name: command.target,
    },
    room: {
      id: room.meta.id,
    },
    matchers: createFuzzyMatcher(),
  });
  const target = indexEntity(results, command.index, isActor);

  if (isNil(target)) {
    await context.state.show('actor.step.hit.type', { command }, ShowVolume.SELF, {
      actor: this,
      room,
    });
    return;
  }

  if (this === target) {
    await context.state.show('actor.step.hit.self', { command }, ShowVolume.SELF, {
      actor: this,
      room,
    });
    return;
  }

  if (this.items.length === 0) {
    await context.state.show('actor.step.hit.item', { target }, ShowVolume.SELF, {
      actor: this,
      room,
    });
    return;
  }

  await context.script.invoke(target, SIGNAL_HIT, {
    ...context,
    actor: this,
    item: this.items[0],
  });
}
