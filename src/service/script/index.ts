import { Logger } from 'noicejs';

import { Command } from '../../model/Command';
import { EntityForType, WorldEntity, WorldEntityType } from '../../model/entity';
import { Actor } from '../../model/entity/Actor';
import { Item } from '../../model/entity/Item';
import { Portal } from '../../model/entity/Portal';
import { Room } from '../../model/entity/Room';
import { ShowVolume, StateSource } from '../../util/actor';
import { ActorTransfer, ItemTransfer, StateEntityTransfer } from '../../util/entity/EntityTransfer';
import { SearchFilter } from '../../util/entity/find';
import { ScriptData } from '../../util/types';
import { LocaleContext } from '../locale';
import { RandomService } from '../random';

export type ScriptTarget = WorldEntity;
export type ScriptFunction = (this: ScriptTarget, context: ScriptContext) => Promise<void>;

export interface StateHelper {
  enter(target: StateSource): Promise<void>;
  find<TType extends WorldEntityType>(search: SearchFilter<TType>): Promise<Array<EntityForType<TType>>>;
  move(target: ActorTransfer | ItemTransfer, context: ScriptContext): Promise<void>; // replaces transfer
  show(msg: string, context?: LocaleContext, volume?: ShowVolume, source?: StateSource): Promise<void>;
  quit(): Promise<void>;
}

/**
 * The script scope fields that must be supplied by the caller.
 */
export interface SuppliedScope {
  /**
   * Assorted data, primitives only.
   */
  data: ScriptData;
  random: RandomService;

  /**
   * Safe access to search and modify state.
   */
  state: StateHelper;

  /**
   * Entity transfer helper.
   *
   * @todo remove in favor of state.move
   */
  transfer: StateEntityTransfer;

  // optional fields
  actor?: Actor;
  command?: Command;
  item?: Item;
  portal?: Portal;
  room?: Room;
}

/**
 * The full script callback scope, including service-supplied fields.
 */
export interface ScriptContext extends SuppliedScope {
  /**
   * Script-specific logger.
   */
  logger: Logger;

  /**
   * Current script service.
   */
  script: ScriptService;
}

export interface ScriptService {
  broadcast(search: SearchFilter<WorldEntityType>, slot: string, scope: SuppliedScope): Promise<void>;
  invoke(target: ScriptTarget, slot: string, scope: SuppliedScope): Promise<void>;
}
