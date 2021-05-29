import { Logger } from 'noicejs';

import { Command } from '../../model/Command';
import { WorldEntity } from '../../model/entity';
import { Actor } from '../../model/entity/Actor';
import { Item } from '../../model/entity/Item';
import { Room } from '../../model/entity/Room';
import { State } from '../../model/State';
import { SearchParams } from '../../util/state';
import { StateEntityTransfer } from '../../util/state/EntityTransfer';
import { StateFocusResolver } from '../../util/state/FocusResolver';
import { Immutable, ScriptData } from '../../util/types';
import { RandomGenerator } from '../random';

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
  focus: StateFocusResolver;

  random: RandomGenerator;

  /**
   * Immutable reference to state for broadcast, lookups, etc.
   */
  state: Immutable<State>;

  /**
   * Entity transfer helper.
   */
  transfer: StateEntityTransfer;

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
