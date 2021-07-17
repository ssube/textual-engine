import { mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { isActor } from '../../../model/entity/Actor';
import { isPortal, PORTAL_TYPE } from '../../../model/entity/Portal';
import { ScriptContext, ScriptTarget } from '../../../service/script';
import { getKey, setKey } from '../../../util/collection/map';
import { STAT_CLOSED } from '../../../util/constants';
import { createFuzzyMatcher } from '../../../util/entity/match';

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
    return context.state.show(context.source, 'actor.open.missing', { command });
  }

  const closed = getKey(portal.stats, STAT_CLOSED, 0);
  if (closed === 0) {
    return context.state.show(context.source, 'actor.open.already', { portal });
  }

  const stats = setKey(portal.stats, STAT_CLOSED, 0);
  await context.state.update(portal, { stats });

  return context.state.show(context.source, 'actor.open.opened', { portal });
}
