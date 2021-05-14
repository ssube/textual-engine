import { Logger } from 'noicejs';

import { Actor } from '../../model/entity/Actor';
import { Item } from '../../model/entity/Item';
import { Room } from '../../model/entity/Room';
import { Metadata } from '../../model/meta/Metadata';
import { State } from '../../model/State';
import { Immutable, ScriptData } from '../../util/types';
import { Command } from '../input';

export type ScriptTarget = Room | Item | Actor;
export type ScriptFunction = (this: ScriptTarget, scope: ScriptScope) => Promise<void>;

export interface ScriptScope {
  /**
   * Assorted data, primitives only.
   */
  data: ScriptData;

  logger: Logger;

  script: ScriptController;

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

export type SuppliedScope = Omit<ScriptScope, 'logger' | 'script'>;

export type ScriptTargetFilter = {
  meta?: Partial<Metadata>;
  room?: Partial<Metadata>;
};

export interface ScriptController {
  broadcast(state: Immutable<State>, filter: ScriptTargetFilter, slot: string, scope: SuppliedScope): Promise<void>;
  invoke(target: ScriptTarget, slot: string, scope: SuppliedScope): Promise<void>;
}
