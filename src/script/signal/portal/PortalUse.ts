import { doesExist, mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError.js';
import { isPortal } from '../../../model/entity/Portal.js';
import { ScriptContext, ScriptTarget } from '../../../service/script/index.js';
import { setKey } from '../../../util/collection/map.js';
import { STAT_LOCKED } from '../../../util/constants.js';
import { matchIdSegments } from '../../../util/string.js';

export async function SignalPortalUse(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isPortal(this)) {
    throw new ScriptTargetError('script target must be a portal');
  }

  const item = mustExist(context.item);
  const key = item.flags.get('key');

  // if item is key, unlock
  if (doesExist(key)) {
    if (matchIdSegments(this.meta.id, key)) {
      const stats = setKey(this.stats, STAT_LOCKED, 0);
      await context.state.update(this, { stats });
      await context.state.show(context.source, 'portal.use.key.unlock', { item, portal: this });
    } else {
      await context.state.show(context.source, 'portal.use.key.wrong', { item, portal: this });
    }
  }

  await context.state.show(context.source, 'portal.use.any', { item });
}
