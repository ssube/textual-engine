/* eslint-disable @typescript-eslint/indent */
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

export type FilterBase<TBase, TCond> = {
  [TKey in keyof TBase]: TBase[TKey] extends TCond ? TKey : never;
};

export type FilterKeys<TBase, TCond> = FilterBase<TBase, TCond>[keyof TBase];
export type Filter<TBase, TCond> = Pick<TBase, FilterKeys<TBase, TCond>>;

/**
 * Remove some fields and redefine them with another type.
 */
export type Replace<TBase, TKey extends keyof TBase, TValue> = Omit<TBase, TKey> & {
  [K in TKey]: TValue;
};

/**
 * Map of stat names to their current value.
 */
export type NumberMap = Map<string, number>;

export type StringMap = Map<string, string>;

