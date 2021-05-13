import { ScriptScope, ScriptTarget } from '..';

export async function RoomStep(this: ScriptTarget, scope: ScriptScope): Promise<void> {
  scope.logger.debug({
    meta: this.meta,
    scope: Object.keys(scope),
  }, 'step script');

  if (this.type === 'room') {
    scope.logger.debug(`room has ${this.portals.length} portals`);
  }

  await scope.script.broadcast(scope.state, {
    id: 'bon',
  }, 'use', scope);
}
