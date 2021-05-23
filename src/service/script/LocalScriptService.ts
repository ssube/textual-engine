import { constructorName, isNil } from '@apextoaster/js-utils';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { ScriptFunction, ScriptService, ScriptTarget, SuppliedScope } from '.';
import { WorldEntity } from '../../model/entity';
import { INJECT_LOGGER } from '../../module';
import { SearchParams, searchState } from '../../util/state';
import { ActorGet } from './common/ActorGet';
import { ActorHit } from './common/ActorHit';
import { ActorStep } from './common/ActorStep';
import { ItemStep } from './common/ItemStep';
import { ItemUse } from './common/ItemUse';
import { RoomStep } from './common/RoomStep';

/**
 * Common scripts, built into the engine and always available.
 */
const COMMON_SCRIPTS: Array<[string, ScriptFunction]> = [
  ['actor-get', ActorGet],
  ['actor-hit', ActorHit],
  ['actor-step', ActorStep],
  ['item-step', ItemStep],
  ['item-use', ItemUse],
  ['room-step', RoomStep],
];

export interface LocalScriptServiceOptions extends BaseOptions {
  [INJECT_LOGGER]: Logger;
}

@Inject(INJECT_LOGGER)
export class LocalScriptService implements ScriptService {
  protected logger: Logger;
  protected scripts: Map<string, ScriptFunction>;

  constructor(options: LocalScriptServiceOptions) {
    this.logger = options[INJECT_LOGGER].child({
      kind: constructorName(this),
    });
    this.scripts = new Map(COMMON_SCRIPTS);
  }

  public async invoke(target: ScriptTarget, slot: string, scope: SuppliedScope): Promise<void> {
    this.logger.debug({ slot, target }, 'invoke slot on target');

    const scriptName = target.slots.get(slot);
    if (isNil(scriptName)) {
      this.logger.debug({ slot, target }, 'target does not have a script defined for slot');
      return;
    }

    const script = this.scripts.get(scriptName);
    if (isNil(script)) {
      this.logger.error({ scriptName }, 'unknown script name');
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

  public async broadcast(filter: Partial<SearchParams>, slot: string, scope: SuppliedScope): Promise<void> {
    const targets = searchState(scope.state, filter);

    for (const target of targets) {
      await this.invoke(target as WorldEntity, slot, scope);
    }
  }
}
