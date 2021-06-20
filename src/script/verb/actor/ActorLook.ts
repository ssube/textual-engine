import { doesExist, mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { isActor } from '../../../model/entity/Actor';
import { ScriptContext, ScriptTarget } from '../../../service/script';
import { head } from '../../../util/collection/array';
import { getKey } from '../../../util/collection/map';
import { SIGNAL_LOOK, STAT_HEALTH } from '../../../util/constants';
import { createFuzzyMatcher } from '../../../util/entity/match';

export async function VerbActorLook(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  const room = mustExist(context.room);
  const sourceContext = {
    ...context,
    actor: this,
  };

  const command = mustExist(context.command);
  if (command.targets.length === 0) {
    const health = getKey(this.stats, STAT_HEALTH, 0);
    await context.state.show('actor.step.look.room.you', { actor: this });
    await context.state.show('actor.step.look.room.health', { actor: this, health });

    for (const item of this.items) {
      await context.script.invoke(item, SIGNAL_LOOK, sourceContext);
    }

    return context.script.invoke(room, SIGNAL_LOOK, sourceContext);
  }

  const results = await context.state.find({
    meta: {
      name: head(command.targets),
    },
    matchers: createFuzzyMatcher(),
  });

  const target = results[command.index];

  if (doesExist(target)) {
    return context.script.invoke(target, SIGNAL_LOOK, sourceContext);
  }

  return context.state.show('actor.step.look.none');
}
