export type KeyList<T> = Array<keyof T>;

/**
 * Map of skill names to their current value.
 */
export type SkillMap = Map<string, number>;

/**
 * Map of stat names to their current value.
 */
export type StatMap = Map<string, number>;

/**
 * Map of verbs (actions) to script keys.
 */
export type VerbMap = Map<string, string>;