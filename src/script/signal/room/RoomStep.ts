import { InvalidArgumentError } from '@apextoaster/js-utils';

import { isRoom } from '../../../model/entity/Room';
import { ScriptContext, ScriptTarget } from '../../../service/script';

export async function RoomStep(this: ScriptTarget, context: ScriptContext): Promise<void> {
  context.logger.debug({
    meta: this.meta,
    scope: Object.keys(context),
  }, 'step script');

  if (!isRoom(this)) {
    throw new InvalidArgumentError('script target must be a room');
  }
}
