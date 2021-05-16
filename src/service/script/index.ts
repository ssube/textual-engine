import { Logger } from 'noicejs';

import { WorldEntity } from '../../model/entity';
import { Actor } from '../../model/entity/Actor';
import { Item } from '../../model/entity/Item';
import { Room } from '../../model/entity/Room';
import { State } from '../../model/State';
import { SearchParams } from '../../util/state';
import { Immutable, ScriptData } from '../../util/types';
import { Command } from '../input';

export interface ScriptFocus {
  setRoom(id: string): Promise<void>;
  setActor(id: string): Promise<void>;
}

export interface ScriptRender {
  read(prompt: string): Promise<string>;
  show(msg: string): Promise<void>;
}

export interface ScriptTransfer {
  moveActor(id: string, source: string, dest: string): Promise<void>;
  moveItem(id: string, source: string, dest: string): Promise<void>;
}

export type ScriptTarget = WorldEntity;
export type ScriptFunction = (this: ScriptTarget, scope: ScriptScope) => Promise<void>;

/**
 * The script scope fields that must be supplied by the caller.
 */
export interface SuppliedScope {
  /**
   * Assorted data, primitives only.
   */
  data: ScriptData;

  /**
   * State focus helper.
   */
  focus: ScriptFocus;

  /**
   * Render I/O helper.
   */
  render: ScriptRender;

  /**
   * Entity transfer helper.
   */
  transfer: ScriptTransfer;

  /**
   * Immutable reference to state for broadcast, lookups, etc.
   */
  state: Immutable<State>;

  // optional fields
  actor?: Actor;
  command?: Command;
  item?: Item;
  room?: Room;
}

/**
 * The full script callback scope, including controller-supplied fields.
 */
export interface ScriptScope extends SuppliedScope {
  /**
   * Script-specific logger.
   */
  logger: Logger;

  /**
   * Current script controller.
   */
  script: ScriptController;
}

export interface ScriptController {
  broadcast(state: Immutable<State>, search: Partial<SearchParams>, slot: string, scope: SuppliedScope): Promise<void>;
  invoke(target: ScriptTarget, slot: string, scope: SuppliedScope): Promise<void>;
}
