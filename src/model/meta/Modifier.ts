import { Entity } from '../entity/Base';
import { Metadata } from '../Metadata';
import { TemplateRef } from './Template';

export interface ModifierString {
  prefix: string;
  suffix: string;
}

export interface ModifierNumber {
  offset: number;
}

export type ModifierMetadata = BaseModifier<Omit<Metadata, 'id' | 'template'>>;

export type ModifierPrimitive<TBase> =
  TBase extends number ? ModifierNumber :
  TBase extends string ? ModifierString :
  TBase extends Metadata ? ModifierMetadata :
  TBase extends Array<Entity> ? Array<TemplateRef> :
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

  id: string;
};
