import { isNone, mergeMap } from '@apextoaster/js-utils';
import { Inject, Logger } from 'noicejs';

import { WorldEntity, WorldEntityType } from '../../model/entity/index.js';
import { INJECT_LOGGER, InjectedOptions } from '../../module/index.js';
import { SignalActorGet } from '../../script/signal/actor/ActorGet.js';
import { SignalActorHit } from '../../script/signal/actor/ActorHit.js';
import { SignalActorLook } from '../../script/signal/actor/ActorLook.js';
import { SignalActorStep } from '../../script/signal/actor/ActorStep.js';
import { SignalActorUse } from '../../script/signal/actor/ActorUse.js';
import { SignalBehaviorEnemy } from '../../script/signal/behavior/common/BehaviorEnemy.js';
import { SignalBehaviorDraculaVanHelsing } from '../../script/signal/behavior/dracula/BehaviorVanHelsing.js';
import { SignalItemLook } from '../../script/signal/item/ItemLook.js';
import { SignalItemReplace } from '../../script/signal/item/ItemReplace.js';
import { SignalItemStep } from '../../script/signal/item/ItemStep.js';
import { SignalItemUse } from '../../script/signal/item/ItemUse.js';
import { SignalPortalLook } from '../../script/signal/portal/PortalLook.js';
import { SignalPortalUse } from '../../script/signal/portal/PortalUse.js';
import { SignalRoomLook } from '../../script/signal/room/RoomLook.js';
import { SignalRoomStep } from '../../script/signal/room/RoomStep.js';
import { VerbActorDrop } from '../../script/verb/actor/ActorDrop.js';
import { VerbActorEquip } from '../../script/verb/actor/ActorEquip.js';
import { VerbActorHit } from '../../script/verb/actor/ActorHit.js';
import { VerbActorLook } from '../../script/verb/actor/ActorLook.js';
import { VerbActorMove } from '../../script/verb/actor/ActorMove.js';
import { VerbActorOpen } from '../../script/verb/actor/ActorOpen.js';
import { VerbActorPush } from '../../script/verb/actor/ActorPush.js';
import { VerbActorReplace } from '../../script/verb/actor/ActorReplace.js';
import { VerbActorSay } from '../../script/verb/actor/ActorSay.js';
import { VerbActorTake } from '../../script/verb/actor/ActorTake.js';
import { VerbActorUse } from '../../script/verb/actor/ActorUse.js';
import { VerbActorWait } from '../../script/verb/actor/ActorWait.js';
import { SearchFilter } from '../../util/entity/find.js';
import { getSignalScripts, getVerbScripts } from '../../util/script/index.js';
import { makeServiceLogger } from '../../util/service/index.js';
import { ScriptFunction, ScriptService, ScriptTarget, SuppliedScope } from './index.js';

export type ScriptPairs = Array<[string, ScriptFunction]>;
/**
 * Common scripts, built into the engine and always available.
 */
const COMMON_SCRIPTS: ScriptPairs = [
  // behavior scripts
  ['signal-behavior-enemy', SignalBehaviorEnemy],
  // signal scripts
  ['signal-actor-get', SignalActorGet],
  ['signal-actor-hit', SignalActorHit],
  ['signal-actor-look', SignalActorLook],
  ['signal-actor-step', SignalActorStep],
  ['signal-actor-use', SignalActorUse],
  ['signal-item-look', SignalItemLook],
  ['signal-item-replace', SignalItemReplace],
  ['signal-item-step', SignalItemStep],
  ['signal-item-use', SignalItemUse],
  ['signal-portal-look', SignalPortalLook],
  ['signal-portal-use', SignalPortalUse],
  ['signal-room-look', SignalRoomLook],
  ['signal-room-step', SignalRoomStep],
  // verb scripts
  ['verb-actor-drop', VerbActorDrop],
  ['verb-actor-equip', VerbActorEquip],
  ['verb-actor-hit', VerbActorHit],
  ['verb-actor-look', VerbActorLook],
  ['verb-actor-move', VerbActorMove],
  ['verb-actor-open', VerbActorOpen],
  ['verb-actor-push', VerbActorPush],
  ['verb-actor-replace', VerbActorReplace],
  ['verb-actor-say', VerbActorSay],
  ['verb-actor-take', VerbActorTake],
  ['verb-actor-use', VerbActorUse],
  ['verb-actor-wait', VerbActorWait],
  // sample worlds
  ['signal-behavior-dracula-van-helsing', SignalBehaviorDraculaVanHelsing],
];

@Inject(INJECT_LOGGER)
export class LocalScriptService implements ScriptService {
  protected logger: Logger;
  protected scripts: Map<string, ScriptFunction>;

  constructor(options: InjectedOptions, scripts: ScriptPairs = COMMON_SCRIPTS) {
    this.logger = makeServiceLogger(options[INJECT_LOGGER], this);
    this.scripts = new Map(scripts);
  }

  public async invoke(target: ScriptTarget, slot: string, scope: SuppliedScope): Promise<void> {
    this.logger.debug({ slot, target: target.meta.id }, 'trying to invoke slot on target');

    const scripts = getVerbScripts(scope);
    mergeMap(scripts, getSignalScripts(target));

    const scriptRef = scripts.get(slot);
    if (isNone(scriptRef)) {
      const scriptNames = Array.from(scripts.keys());
      this.logger.debug({ slot, scriptNames, target: target.meta.id }, 'target does not have a script defined for slot');
      return;
    }

    const scriptName = this.scripts.get(scriptRef.name);
    if (isNone(scriptName)) {
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
      if (err instanceof Error) {
        this.logger.error(err, 'error invoking script');
      } else {
        this.logger.error('unknown error invoking script');
      }
    }
  }

  public async broadcast(filter: SearchFilter<WorldEntityType>, slot: string, scope: SuppliedScope): Promise<void> {
    const targets = await scope.state.find(filter);

    for (const target of targets) {
      await this.invoke(target as WorldEntity, slot, scope);
    }
  }
}
