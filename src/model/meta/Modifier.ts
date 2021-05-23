import { Metadata } from './Metadata';

export interface ModifierString {
  prefix: string;
  suffix: string;
}

export interface ModifierNumber {
  offset: number;
}

export type ModifierPrimitive<TBase> =
  TBase extends number ? ModifierNumber :
  TBase extends string ? ModifierString :
  TBase extends Metadata ? BaseModifier<Omit<Metadata, 'id' | 'template'>> :
  TBase extends Array<infer TValue> ? Array<ModifierPrimitive<TValue>> :
  TBase extends Map<infer TKey, infer TValue> ? Map<TKey, ModifierPrimitive<TValue>> :
  TBase extends object ? BaseModifier<TBase> :
  never;

export type BaseModifier<TBase> = {
  [TKey in keyof TBase]: ModifierPrimitive<TBase[TKey]>;
};

export type Modifier<TEntity> = BaseModifier<TEntity> & {
  /**
   * Chance of this modifier appearing.
   */
  chance: number;

  /**
   * Other modifiers that cannot appear with this one.
   */
  excludes: Array<string>;
};
