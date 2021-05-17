/**
 * Deep readonly type.
 *
 * From https://github.com/microsoft/TypeScript/issues/13923#issuecomment-653675557
 */
export type Immutable<TBase> =
  // eslint-disable-next-line @typescript-eslint/ban-types
  TBase extends Function | boolean | number | string | null | undefined ? TBase :
  TBase extends Array<infer TValue> ? ReadonlyArray<Immutable<TValue>> :
  TBase extends Map<infer TKey, infer TValue> ? ReadonlyMap<Immutable<TKey>, Immutable<TValue>> :
  TBase extends Set<infer TValue> ? ReadonlySet<Immutable<TValue>> :
  { readonly [TKey in keyof TBase]: Immutable<TBase[TKey]> };

export type KeyList<TList> = Array<keyof TList>;

/**
 * Remove some fields and redefine them with another type.
 */
export type Replace<TBase, TKey extends keyof TBase, TValue> = Omit<TBase, TKey> & {
  [K in TKey]: TValue;
};

/**
 * Map of skill names to their current value.
 */
export type SkillMap = Map<string, number>;

export type SlotMap = Map<string, string>;

/**
 * Map of stat names to their current value.
 */
export type StatMap = Map<string, number>;

export type ScriptData = Record<string, number | string>;

export interface VerbSlot {
  slot: string;
  data: ScriptData;
}

/**
 * Map of verbs (actions) to script keys.
 */
export type VerbMap = Map<string, VerbSlot>;
