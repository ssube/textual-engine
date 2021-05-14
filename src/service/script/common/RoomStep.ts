import { InvalidArgumentError } from '@apextoaster/js-utils';
import { ScriptScope, ScriptTarget } from '..';

export async function RoomStep(this: ScriptTarget, scope: ScriptScope): Promise<void> {
  scope.logger.debug({
    meta: this.meta,
    scope: Object.keys(scope),
  }, 'step script');

  if (this.type !== 'room') {
    throw new InvalidArgumentError('script target must be a room');
  }

  // TODO: remove
  await scope.script.broadcast(scope.state, {
    meta: {
      id: 'bon',
    },
    room: {
      id: this.meta.id,
    },
  }, 'use', scope);
}
