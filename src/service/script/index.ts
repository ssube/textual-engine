export type SlotMap = Map<string, string>;

export type ScriptScope = Record<string, unknown>;
export interface ScriptTarget {
  slots: SlotMap;
}

export interface ScriptController {
  invoke(target: ScriptTarget, slot: string, scope: ScriptScope): Promise<void>;
}
