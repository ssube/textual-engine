import { doesExist, mustExist } from '@apextoaster/js-utils';

import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { head } from '../../../util/collection/array.js';
import { SIGNAL_LOOK } from '../../../util/constants.js';
import { createFuzzyMatcher } from '../../../util/entity/match.js';
import { assertActor } from '../../../util/script/assert.js';

export async function VerbActorLook(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const actor = assertActor(this);

  const room = mustExist(context.room);
  const sourceContext = {
    ...context,
    actor,
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
