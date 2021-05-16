import { isNil } from '@apextoaster/js-utils';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { ScriptController, ScriptFunction, ScriptTarget, SuppliedScope } from '.';
import { WorldEntity } from '../../model/entity';
import { INJECT_LOGGER } from '../../module';
import { SearchParams, searchState } from '../../util/state';
import { ActorHit } from './common/ActorHit';
import { ActorStep } from './common/ActorStep';
import { ItemStep } from './common/ItemStep';
import { ItemUse } from './common/ItemUse';
import { RoomStep } from './common/RoomStep';

const BASE_SCRIPTS: Array<[string, ScriptFunction]> = [
  ['actor-hit', ActorHit],
  ['actor-step', ActorStep],
  ['item-step', ItemStep],
  ['item-use', ItemUse],
  ['room-step', RoomStep],
];

export interface LocalScriptControllerOptions extends BaseOptions {
  [INJECT_LOGGER]: Logger;
}

@Inject(INJECT_LOGGER)
export class LocalScriptController implements ScriptController {
  protected logger: Logger;
  protected scripts: Map<string, ScriptFunction>;

  constructor(options: LocalScriptControllerOptions) {
    this.logger = options[INJECT_LOGGER].child({
      kind: LocalScriptController.name,
    });
    this.scripts = new Map(BASE_SCRIPTS);
  }

  async invoke(target: ScriptTarget, slot: string, scope: SuppliedScope): Promise<void> {
    this.logger.debug(`invoke ${slot} on ${target.meta.id}`);

    const scriptName = target.slots.get(slot);
    if (isNil(scriptName)) {
      this.logger.debug({ slot }, 'target does not have a script defined for slot');
      return;
    }

    const script = this.scripts.get(scriptName);
    if (isNil(script)) {
      this.logger.error(`unknown script ${scriptName}`);
      return;
    }

    await script.call(target, {
      ...scope,
      logger: this.logger.child({
        script: scriptName,
      }),
      script: this,
    });
  }

  async broadcast(filter: Partial<SearchParams>, slot: string, scope: SuppliedScope): Promise<void> {
    const targets = searchState(scope.state, filter);

    for (const target of targets) {
      await this.invoke(target as WorldEntity, slot, scope);
    }
  }
}