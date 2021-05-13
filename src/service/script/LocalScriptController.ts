import { doesExist, isNil } from '@apextoaster/js-utils';

import { ScriptController, ScriptFunction, ScriptScope, ScriptTarget, ScriptTargetFilter } from '.';
import { State } from '../../models/State';
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

    await script.call(target, scope, this);
  }

  async broadcast(state: State, filter: ScriptTargetFilter, slot: string, scope: ScriptScope): Promise<void> {
    for (const room of state.rooms) {
      if (this.match(room, filter)) {
        await this.invoke(room, slot, scope);
      }

      for (const actor of room.actors) {
        if (this.match(actor, filter)) {
          await this.invoke(actor, slot, scope);
        }

        for (const item of actor.items) {
          if (this.match(item, filter)) {
            await this.invoke(item, slot, scope);
          }
        }
      }

      for (const item of room.items) {
        if (this.match(item, filter)) {
          await this.invoke(item, slot, scope);
        }
      }
    }
  }

  match(target: ScriptTarget, filter: ScriptTargetFilter): boolean {
    if (doesExist(filter.id)) {
      return target.meta.id.toLocaleLowerCase().startsWith(filter.id);
    }

    if (doesExist(filter.name)) {
      return target.meta.id.toLocaleLowerCase().includes(filter.name);
    }

    return false;
  }
}