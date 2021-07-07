import { Logger } from 'noicejs';

import { Command } from '../../model/Command';
import { EntityForType, WorldEntity, WorldEntityType } from '../../model/entity';
import { ReadonlyActor } from '../../model/entity/Actor';
import { ReadonlyItem } from '../../model/entity/Item';
import { ReadonlyPortal } from '../../model/entity/Portal';
import { ReadonlyRoom } from '../../model/entity/Room';
import { ScriptData } from '../../model/Script';
import { ShowVolume, StateSource } from '../../util/actor';
import { ActorTransfer, ItemTransfer } from '../../util/entity/EntityTransfer';
import { SearchFilter } from '../../util/entity/find';
import { Immutable } from '../../util/types';
import { LocaleContext } from '../locale';
import { RandomService } from '../random';
import { StepResult } from '../state';

export type ScriptTarget = Immutable<WorldEntity>;
export type ScriptFunction = (this: ScriptTarget, context: ScriptContext) => Promise<void>;

export interface CommandHelper {
  depth(actor: ReadonlyActor): Promise<number>;
  queue(actor: ReadonlyActor, command: Command): Promise<void>; // TODO: add append/prepend/replace flag
  ready(actor: ReadonlyActor): Promise<boolean>;
}

export interface StateHelper {
  create<TType extends WorldEntityType>(id: string, type: TType, target: StateSource): Promise<Immutable<EntityForType<TType>>>;
  enter(target: StateSource): Promise<void>; // TODO: remove, auto-invoke as part of move
  find<TType extends WorldEntityType>(search: SearchFilter<TType>): Promise<Array<Immutable<EntityForType<TType>>>>;
  move(target: ActorTransfer | ItemTransfer, context: ScriptContext): Promise<void>;
  show(source: StateSource, msg: string, context?: LocaleContext, volume?: ShowVolume): Promise<void>;
  quit(msg: string, context?: LocaleContext, stats?: Array<string>): Promise<void>;
  update<TEntity extends WorldEntity>(entity: Immutable<TEntity>, changes: Partial<Immutable<TEntity>>): Promise<void>;
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

  source: StateSource;

  /**
   * Safe access to search and modify state.
   */
  state: StateHelper;

  step: StepResult;

  // optional fields
  actor?: ReadonlyActor;
  command?: Immutable<Command>;
  item?: ReadonlyItem;
  portal?: ReadonlyPortal;
  room?: ReadonlyRoom;
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
