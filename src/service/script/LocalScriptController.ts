import { isNil } from '@apextoaster/js-utils';

import { ScriptController, ScriptFunction, ScriptScope, ScriptTarget } from '.';
import { ActorStep } from './common/ActorStep';
import { ItemStep } from './common/ItemStep';
import { RoomStep } from './common/RoomStep';

const BASE_SCRIPTS: Array<[string, ScriptFunction]> = [
  ['actor-step', ActorStep],
  ['item-step', ItemStep],
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
    if (isNil(scriptName)) {
      console.log('target does not have script defined for slot');
      return;
    }

    const script = this.scripts.get(scriptName);
    if (isNil(script)) {
      console.log(`unknown script ${scriptName}`);
      return;
    }

    await script.call(target, scope);
  }
}