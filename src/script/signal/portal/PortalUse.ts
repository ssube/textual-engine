import { doesExist, mustExist } from '@apextoaster/js-utils';

import { ScriptTargetError } from '../../../error/ScriptTargetError';
import { isPortal } from '../../../model/entity/Portal';
import { ScriptContext, ScriptTarget } from '../../../service/script';
import { STAT_LOCKED } from '../../../util/constants';
import { matchIdSegments } from '../../../util/string';

export async function SignalPortalUse(this: ScriptTarget, context: ScriptContext): Promise<void> {
  if (!isPortal(this)) {
    throw new ScriptTargetError('script target must be a portal');
  }

  const item = mustExist(context.item);
  const key = item.flags.get('key');

  // if item is key, unlock
  if (doesExist(key)) {
    if (matchIdSegments(this.meta.id, key)) {
      this.stats.set(STAT_LOCKED, 0);
      await context.state.show(context.source, 'portal.use.key.unlock', { item, portal: this });
    } else {
      await context.state.show(context.source, 'portal.use.key.wrong', { item, portal: this });
    }
  }

  await context.state.show(context.source, 'portal.use.any', { item });
}
