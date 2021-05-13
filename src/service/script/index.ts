export type SlotMap = Map<string, string>;

export interface ScriptTarget {
  slots: SlotMap;
}

export interface ScriptController {
  invoke(target: ScriptTarget, slot: string, scope: Record<string, unknown>): Promise<void>;
}
