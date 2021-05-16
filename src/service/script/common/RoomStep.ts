import { InvalidArgumentError } from '@apextoaster/js-utils';

import { ScriptScope, ScriptTarget } from '..';
import { isRoom } from '../../../model/entity/Room';

export async function RoomStep(this: ScriptTarget, scope: ScriptScope): Promise<void> {
  scope.logger.debug({
    meta: this.meta,
    scope: Object.keys(scope),
  }, 'step script');

  if (!isRoom(this)) {
    throw new InvalidArgumentError('script target must be a room');
  }

  // TODO: remove
  await scope.script.broadcast(scope.state, {
    meta: {
      id: 'actor-goblin',
    },
    room: {
      id: this.meta.id,
    },
  }, 'use', scope);
}
