import { ScriptController, ScriptScope, ScriptTarget } from '..';

export async function RoomStep(this: ScriptTarget, scope: ScriptScope, script: ScriptController): Promise<void> {
  console.log('step script', this.meta.id, Object.keys(scope));

  if (this.type === 'room') {
    console.log(`room has ${this.portals.length} portals`);
  }

  await script.broadcast(scope.state, {
    id: 'bon',
  }, 'use', scope);
}
