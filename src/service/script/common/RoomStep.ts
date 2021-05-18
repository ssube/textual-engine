import { InvalidArgumentError } from '@apextoaster/js-utils';

import { ScriptContext, ScriptTarget } from '..';
import { isRoom } from '../../../model/entity/Room';
import { SLOT_USE } from '../../../util/constants';

export async function RoomStep(this: ScriptTarget, context: ScriptContext): Promise<void> {
  context.logger.debug({
    meta: this.meta,
    scope: Object.keys(context),
  }, 'step script');

  if (!isRoom(this)) {
    throw new InvalidArgumentError('script target must be a room');
  }

  // TODO: remove, testing broadcast system
  await context.script.broadcast({
    meta: {
      id: 'actor-goblin',
    },
    room: {
      id: this.meta.id,
    },
  }, SLOT_USE, context);
}
