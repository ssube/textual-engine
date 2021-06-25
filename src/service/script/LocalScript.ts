import { isNil, mergeMap } from '@apextoaster/js-utils';
import { Inject, Logger } from 'noicejs';

import { ScriptFunction, ScriptService, ScriptTarget, SuppliedScope } from '.';
import { WorldEntity, WorldEntityType } from '../../model/entity';
import { INJECT_LOGGER, InjectedOptions } from '../../module';
import { SignalActorGet } from '../../script/signal/actor/ActorGet';
import { SignalActorHit } from '../../script/signal/actor/ActorHit';
import { SignalActorLook } from '../../script/signal/actor/ActorLook';
import { SignalActorStep } from '../../script/signal/actor/ActorStep';
import { SignalActorUse } from '../../script/signal/actor/ActorUse';
import { SignalItemLook } from '../../script/signal/item/ItemLook';
import { SignalItemStep } from '../../script/signal/item/ItemStep';
import { SignalItemUse } from '../../script/signal/item/ItemUse';
import { SignalPortalLook } from '../../script/signal/portal/PortalLook';
import { SignalPortalUse } from '../../script/signal/portal/PortalUse';
import { SignalRoomLook } from '../../script/signal/room/RoomLook';
import { SignalRoomStep } from '../../script/signal/room/RoomStep';
import { VerbActorDrop } from '../../script/verb/actor/ActorDrop';
import { VerbActorEquip } from '../../script/verb/actor/ActorEquip';
import { VerbActorHit } from '../../script/verb/actor/ActorHit';
import { VerbActorLook } from '../../script/verb/actor/ActorLook';
import { VerbActorMove } from '../../script/verb/actor/ActorMove';
import { VerbActorOpen } from '../../script/verb/actor/ActorOpen';
import { VerbActorPush } from '../../script/verb/actor/ActorPush';
import { VerbActorTake } from '../../script/verb/actor/ActorTake';
import { VerbActorUse } from '../../script/verb/actor/ActorUse';
import { VerbActorWait } from '../../script/verb/actor/ActorWait';
import { SearchFilter } from '../../util/entity/find';
import { getSignalScripts, getVerbScripts } from '../../util/script';
import { makeServiceLogger } from '../../util/service';

/**
 * Common scripts, built into the engine and always available.
 */
const COMMON_SCRIPTS: Array<[string, ScriptFunction]> = [
  // signal scripts
  ['signal-actor-get', SignalActorGet],
  ['signal-actor-hit', SignalActorHit],
  ['signal-actor-look', SignalActorLook],
  ['signal-actor-step', SignalActorStep],
  ['signal-actor-use', SignalActorUse],
  ['signal-item-look', SignalItemLook],
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
  ['verb-actor-take', VerbActorTake],
  ['verb-actor-use', VerbActorUse],
  ['verb-actor-wait', VerbActorWait],
];

@Inject(INJECT_LOGGER)
export class LocalScriptService implements ScriptService {
  protected logger: Logger;
  protected scripts: Map<string, ScriptFunction>;

  constructor(options: InjectedOptions, scripts = COMMON_SCRIPTS) {
    this.logger = makeServiceLogger(options[INJECT_LOGGER], this);
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
