import { constructorName, isNil } from '@apextoaster/js-utils';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { ScriptFunction, ScriptService, ScriptTarget, SuppliedScope } from '.';
import { WorldEntity } from '../../model/entity';
import { INJECT_LOGGER } from '../../module';
import { ActorGet } from '../../script/signal/actor/ActorGet';
import { ActorHit } from '../../script/signal/actor/ActorHit';
import { ActorStep } from '../../script/signal/actor/ActorStep';
import { ItemStep } from '../../script/signal/item/ItemStep';
import { ItemUse } from '../../script/signal/item/ItemUse';
import { RoomStep } from '../../script/signal/room/RoomStep';
import {
  ActorStepDrop,
  ActorStepHit,
  ActorStepLook,
  ActorStepMove,
  ActorStepTake,
  ActorStepUse,
  ActorStepWait,
} from '../../script/verb/common';
import { getScripts, SearchParams, searchState } from '../../util/state';

/**
 * Common scripts, built into the engine and always available.
 */
const COMMON_SCRIPTS: Array<[string, ScriptFunction]> = [
  // signal scripts
  ['actor-get', ActorGet],
  ['actor-hit', ActorHit],
  ['actor-step', ActorStep],
  ['item-step', ItemStep],
  ['item-use', ItemUse],
  ['room-step', RoomStep],
  // verb scripts
  ['verb-drop', ActorStepDrop],
  ['verb-hit', ActorStepHit],
  ['verb-look', ActorStepLook],
  ['verb-move', ActorStepMove],
  ['verb-take', ActorStepTake],
  ['verb-use', ActorStepUse],
  ['verb-wait', ActorStepWait],
];

export interface LocalScriptServiceOptions extends BaseOptions {
  [INJECT_LOGGER]: Logger;
}

@Inject(INJECT_LOGGER)
export class LocalScriptService implements ScriptService {
  protected logger: Logger;
  protected scripts: Map<string, ScriptFunction>;

  constructor(options: LocalScriptServiceOptions, scripts = COMMON_SCRIPTS) {
    this.logger = options[INJECT_LOGGER].child({
      kind: constructorName(this),
    });
    this.scripts = new Map(scripts);
  }

  public async invoke(target: ScriptTarget, slot: string, scope: SuppliedScope): Promise<void> {
    this.logger.debug({ slot, target }, 'trying to invoke slot on target');

    const scripts = getScripts(scope.state, target);
    const scriptRef = scripts.get(slot);

    if (isNil(scriptRef)) {
      this.logger.debug({ slot, scripts, target }, 'target does not have a script defined for slot');
      return;
    }

    const scriptName = this.scripts.get(scriptRef.name);
    if (isNil(scriptName)) {
      this.logger.error({
        scriptRef,
        scripts: Array.from(scripts.keys()),
      }, 'unknown script name');
      return;
    }

    this.logger.debug({ scriptRef, target }, 'invoking script on target');

    try {
      await scriptName.call(target, {
        ...scope,
        logger: this.logger.child({
          script: scriptRef.name,
        }),
        script: this,
      });
    } catch (err) {
      this.logger.error(err, 'error invoking script');
    }
  }

  public async broadcast(filter: Partial<SearchParams>, slot: string, scope: SuppliedScope): Promise<void> {
    const targets = searchState(scope.state, filter);

    for (const target of targets) {
      await this.invoke(target as WorldEntity, slot, scope);
    }
  }
}
