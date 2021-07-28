import { doesExist, mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError.js';
import { isActor } from '../../../model/entity/Actor.js';
import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { head } from '../../../util/collection/array.js';
import { SIGNAL_LOOK } from '../../../util/constants.js';
import { createFuzzyMatcher } from '../../../util/entity/match.js';

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
    await context.script.invoke(this, SIGNAL_LOOK, sourceContext);
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

  return context.state.show(context.source, 'actor.verb.look.missing');
}
