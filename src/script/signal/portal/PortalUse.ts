import { mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { isPortal } from '../../../model/entity/Portal';
import { ScriptContext, ScriptTarget } from '../../../service/script';
import { getKey } from '../../../util/collection/map';
import { STAT_LOCKED } from '../../../util/constants';

export async function SignalPortalUse(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isPortal(this)) {
    throw new ScriptTargetError('script target must be a portal');
  }

  const item = mustExist(context.item);
  const key = getKey(item.stats, 'key', 0);

  // if item is key, unlock
  if (key > 0) {
    this.stats.set(STAT_LOCKED, 0);
    await context.state.show(context.source, 'portal.use.unlock', { item, portal: this });
  }

  await context.state.show(context.source, 'portal.use.any', { item });
}
