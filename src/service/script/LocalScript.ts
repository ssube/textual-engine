import { constructorName, isNil, mergeMap, mustExist } from '@apextoaster/js-utils';
import { Inject, Logger } from 'noicejs';

import { ScriptFunction, ScriptService, ScriptTarget, SuppliedScope } from '.';
import { WorldEntity, WorldEntityType } from '../../model/entity';
import { INJECT_LOGGER, InjectedOptions } from '../../module';
import { SignalActorGet } from '../../script/signal/actor/ActorGet';
import { SignalActorHit } from '../../script/signal/actor/ActorHit';
import { SignalActorStep } from '../../script/signal/actor/ActorStep';
import { SignalItemStep } from '../../script/signal/item/ItemStep';
import { SignalItemUse } from '../../script/signal/item/ItemUse';
import { SignalRoomStep } from '../../script/signal/room/RoomStep';
import { VerbActorDrop } from '../../script/verb/ActorDrop';
import { VerbActorHit } from '../../script/verb/ActorHit';
import { VerbActorLook } from '../../script/verb/ActorLook';
import { VerbActorMove } from '../../script/verb/ActorMove';
import { VerbActorTake } from '../../script/verb/ActorTake';
import { VerbActorUse } from '../../script/verb/ActorUse';
import { VerbActorWait } from '../../script/verb/ActorWait';
import { getSignalScripts, getVerbScripts } from '../../util/script';
import { SearchFilter } from '../../util/state/search';

/**
 * Common scripts, built into the engine and always available.
 */
const COMMON_SCRIPTS: Array<[string, ScriptFunction]> = [
  // signal scripts
  ['actor-get', SignalActorGet],
  ['actor-hit', SignalActorHit],
  ['actor-step', SignalActorStep],
  ['item-step', SignalItemStep],
  ['item-use', SignalItemUse],
  ['room-step', SignalRoomStep],
  // verb scripts
  ['verb-drop', VerbActorDrop],
  ['verb-hit', VerbActorHit],
  ['verb-look', VerbActorLook],
  ['verb-move', VerbActorMove],
  ['verb-take', VerbActorTake],
  ['verb-use', VerbActorUse],
  ['verb-wait', VerbActorWait],
];

@Inject(INJECT_LOGGER)
export class LocalScriptService implements ScriptService {
  protected logger: Logger;
  protected scripts: Map<string, ScriptFunction>;

  constructor(options: InjectedOptions, scripts = COMMON_SCRIPTS) {
    this.logger = mustExist(options[INJECT_LOGGER]).child({
      kind: constructorName(this),
    });
    this.scripts = new Map(scripts);
  }

  public async invoke(target: ScriptTarget, slot: string, scope: SuppliedScope): Promise<void> {
    this.logger.debug({ slot, target: target.meta.id }, 'trying to invoke slot on target');

    const scripts = getVerbScripts(scope);
    mergeMap(scripts, getSignalScripts(target));

    const scriptRef = scripts.get(slot);
    if (isNil(scriptRef)) {
      const scriptNames = Array.from(scripts.keys());
      this.logger.debug({ slot, scriptNames, target: target.meta.id }, 'target does not have a script defined for slot');
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

    this.logger.debug({ scriptRef, target: target.meta.id }, 'invoking script on target');

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

  public async broadcast(filter: SearchFilter<WorldEntityType>, slot: string, scope: SuppliedScope): Promise<void> {
    const targets = await scope.state.find(filter);

    for (const target of targets) {
      await this.invoke(target as WorldEntity, slot, scope);
    }
  }
}
