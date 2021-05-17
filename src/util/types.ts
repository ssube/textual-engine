/**
 * Deep readonly type.
 *
 * From https://github.com/microsoft/TypeScript/issues/13923#issuecomment-653675557
 */
export type Immutable<T> =
  // eslint-disable-next-line @typescript-eslint/ban-types
  T extends Function | boolean | number | string | null | undefined ? T :
  T extends Array<infer U> ? ReadonlyArray<Immutable<U>> :
  T extends Map<infer K, infer V> ? ReadonlyMap<Immutable<K>, Immutable<V>> :
  T extends Set<infer S> ? ReadonlySet<Immutable<S>> :
  { readonly [P in keyof T]: Immutable<T[P]> };

export type KeyList<T> = Array<keyof T>;

/**
 * Remove some fields and redefine them with another type.
 */
export type Replace<T, TKey extends keyof T, TValue> = Omit<T, TKey> & {
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
