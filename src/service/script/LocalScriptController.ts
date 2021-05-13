import { ScriptController, ScriptFunction, ScriptScope, ScriptTarget } from '.';
import { RoomStep } from './common/RoomStep';

const BASE_SCRIPTS: Array<[string, ScriptFunction]> = [
  ['room-step', RoomStep],
];

export class LocalScriptController implements ScriptController {
  protected scripts: Map<string, ScriptFunction>;

  constructor() {
    this.scripts = new Map(BASE_SCRIPTS);
  }

  async invoke(target: ScriptTarget, slot: string, scope: ScriptScope): Promise<void> {
    console.log(`invoke ${slot} on ${target.meta.id}`);

    const scriptName = target.slots.get(slot);
    if (scriptName === null || scriptName === undefined) {
      console.log('target does not have script defined for slot');
      return;
    }

    const script = this.scripts.get(scriptName);
    if (script === null || script === undefined) {
      console.log(`unknown script ${scriptName}`);
      return;
    }

    await script.call(target, scope);
  }
}