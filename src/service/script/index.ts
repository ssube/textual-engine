import { Actor } from '../../models/entity/Actor';
import { Item } from '../../models/entity/Item';
import { Room } from '../../models/entity/Room';

export type SlotMap = Map<string, string>;

export type ScriptFunction = (this: ScriptTarget, scope: ScriptScope) => Promise<void>;
export type ScriptScope = Record<string, unknown>;
export type ScriptTarget = Room | Item | Actor;

export interface ScriptController {
  invoke(target: ScriptTarget, slot: string, scope: ScriptScope): Promise<void>;
}
