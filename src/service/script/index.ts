import { Logger } from 'noicejs';

import { Command } from '../../model/Command';
import { WorldEntity } from '../../model/entity';
import { Actor } from '../../model/entity/Actor';
import { Item } from '../../model/entity/Item';
import { Room } from '../../model/entity/Room';
import { WorldState } from '../../model/world/State';
import { ShowSource, ShowVolume } from '../../util/actor';
import { SearchParams } from '../../util/state';
import { StateEntityTransfer } from '../../util/state/EntityTransfer';
import { Immutable, ScriptData } from '../../util/types';
import { LocaleContext } from '../locale';
import { RandomGenerator } from '../random';

export type ScriptTarget = WorldEntity;
export type ScriptFunction = (this: ScriptTarget, context: ScriptContext) => Promise<void>;

export interface StateHelper {
  enter: (target: ShowSource) => Promise<void>;
  // find: () => Promise<Array<WorldEntity>>; // replaces searchState
  // move: () => Promise<void>; // replaces transfer
  show: (msg: string, context?: LocaleContext, volume?: ShowVolume, source?: ShowSource) => Promise<void>;
  quit: () => Promise<void>;
}

/**
 * The script scope fields that must be supplied by the caller.
 */
export interface SuppliedScope {
  /**
   * Assorted data, primitives only.
   */
  data: ScriptData;

  random: RandomGenerator;

  /**
   * Immutable reference to state for broadcast, lookups, etc.
   *
   * @todo remove direct reference
   */
  state: Immutable<WorldState>;

  stateHelper: StateHelper;

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
