import { doesExist, mustExist } from '@apextoaster/js-utils';

import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { setKey } from '../../../util/collection/map.js';
import { STAT_LOCKED } from '../../../util/constants.js';
import { assertPortal } from '../../../util/script/assert.js';
import { matchIdSegments } from '../../../util/string.js';

export async function SignalPortalUse(this: ScriptTarget, context: ScriptContext): Promise<void> {
  const portal = assertPortal(this);

  const item = mustExist(context.item);
  const key = item.flags.get('key');

  // if item is key, unlock
  if (doesExist(key)) {
    if (matchIdSegments(portal.meta.id, key)) {
      const stats = setKey(portal.stats, STAT_LOCKED, 0);
      await context.state.update(portal, { stats });
      await context.state.show(context.source, 'portal.use.key.unlock', { item, portal });
    } else {
      await context.state.show(context.source, 'portal.use.key.wrong', { item, portal });
    }
  }

  await context.state.show(context.source, 'portal.use.any', { item });
}
