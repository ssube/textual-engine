import { Logger } from 'noicejs';

import { Command } from '../../model/Command';
import { EntityForType, WorldEntity, WorldEntityType } from '../../model/entity';
import { Actor } from '../../model/entity/Actor';
import { Item } from '../../model/entity/Item';
import { Portal } from '../../model/entity/Portal';
import { Room } from '../../model/entity/Room';
import { ScriptData } from '../../model/Script';
import { ShowVolume, StateSource } from '../../util/actor';
import { ActorTransfer, ItemTransfer, StateEntityTransfer } from '../../util/entity/EntityTransfer';
import { SearchFilter } from '../../util/entity/find';
import { LocaleContext } from '../locale';
import { RandomService } from '../random';

export type ScriptTarget = WorldEntity;
export type ScriptFunction = (this: ScriptTarget, context: ScriptContext) => Promise<void>;

export interface CommandHelper {
  depth(actor: Actor): Promise<number>;
  queue(actor: Actor, command: Command): Promise<void>; // TODO: add append/prepend/replace flag
  ready(actor: Actor): Promise<boolean>;
}

export interface StateHelper {
  create<TType extends WorldEntityType>(id: string, type: TType, target: StateSource): Promise<EntityForType<TType>>;
  enter(target: StateSource): Promise<void>; // TODO: remove, auto-invoke as part of move
  find<TType extends WorldEntityType>(search: SearchFilter<TType>): Promise<Array<EntityForType<TType>>>;
  move(target: ActorTransfer | ItemTransfer, context: ScriptContext): Promise<void>; // replaces transfer
  show(source: StateSource, msg: string, context?: LocaleContext, volume?: ShowVolume): Promise<void>;
  quit(): Promise<void>;
  update(entity: WorldEntity): Promise<void>;
}

/**
 * The script scope fields that must be supplied by the caller.
 */
export interface SuppliedScope {
  behavior: CommandHelper;

  /**
   * Assorted data, primitives only.
   */
  data: ScriptData;
  random: RandomService;

  /**
   * Safe access to search and modify state.
   */
  state: StateHelper;

  source: StateSource;

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
  target?: WorldEntity;
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
