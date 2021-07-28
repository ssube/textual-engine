import { mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError.js';
import { isActor } from '../../../model/entity/Actor.js';
import { isPortal, PORTAL_TYPE } from '../../../model/entity/Portal.js';
import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { getKey, setKey } from '../../../util/collection/map.js';
import { SIGNAL_LOOK, STAT_CLOSED } from '../../../util/constants.js';
import { createFuzzyMatcher } from '../../../util/entity/match.js';

export async function VerbActorOpen(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isActor(this)) {
    throw new ScriptTargetError('script target must be an actor');
  }

  const command = mustExist(context.command);

  const [portal] = await context.state.find({
    matchers: createFuzzyMatcher(),
    meta: {
      name: command.targets[0],
    },
    type: PORTAL_TYPE,
  });

  if (!isPortal(portal)) {
    return context.state.show(context.source, 'actor.verb.open.missing', { command });
  }

  const closed = getKey(portal.stats, STAT_CLOSED, 0);
  if (closed === 0) {
    return context.state.show(context.source, 'actor.verb.open.already', { portal });
  }

  const stats = setKey(portal.stats, STAT_CLOSED, 0);
  await context.state.update(portal, { stats });

  await context.state.show(context.source, 'actor.verb.open.portal', { portal });
  return context.script.invoke(portal, SIGNAL_LOOK, context);
}
