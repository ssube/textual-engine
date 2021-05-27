import { Logger } from 'noicejs';

import { Command } from '../../model/Command';
import { WorldEntity } from '../../model/entity';
import { Actor } from '../../model/entity/Actor';
import { Item } from '../../model/entity/Item';
import { Room } from '../../model/entity/Room';
import { State } from '../../model/State';
import { LocaleContext } from '../../service/locale';
import { SearchParams } from '../../util/state';
import { Immutable, ScriptData } from '../../util/types';
import { RandomGenerator } from '../random';

export interface ScriptFocus {
  /**
   * Set the currently-focused room.
   */
  setRoom(id: string): Promise<void>;

  /**
   * Set the currently-focused actor.
   */
  setActor(id: string): Promise<void>;

  /**
   * Display a message from an entity.
   */
  show(msg: string, context?: LocaleContext): Promise<void>;
}

export interface TransferParams<TEntity extends WorldEntity> {
  /**
   * The entity to transfer.
   */
  moving: TEntity;

  /**
   * The source container from which `id` will be transferred.
   */
  source: string;

  /**
   * The target container into which `id` will be transferred.
   */
  target: string;
}

export interface ScriptTransfer {
  /**
   * Move an actor from one room to another.
   */
  moveActor(transfer: TransferParams<Actor>, context: ScriptContext): Promise<void>;

  /**
   * Move an item from one actor or room to another.
   */
  moveItem(transfer: TransferParams<Item>, context: ScriptContext): Promise<void>;
}

export type ScriptTarget = WorldEntity;
export type ScriptFunction = (this: ScriptTarget, context: ScriptContext) => Promise<void>;

/**
 * The script scope fields that must be supplied by the caller.
 */
export interface SuppliedScope {
  /**
   * Assorted data, primitives only.
   */
  data: ScriptData;

  /**
   * State output helper.
   */
  focus: ScriptFocus;

  random: RandomGenerator;

  /**
   * Immutable reference to state for broadcast, lookups, etc.
   */
  state: Immutable<State>;

  /**
   * Entity transfer helper.
   */
  transfer: ScriptTransfer;

  // optional fields
  actor?: Actor;
  command?: Command;
  item?: Item;
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
  broadcast(search: Partial<SearchParams>, slot: string, scope: SuppliedScope): Promise<void>;
  invoke(target: ScriptTarget, slot: string, scope: SuppliedScope): Promise<void>;
}
