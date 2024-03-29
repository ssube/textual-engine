/* eslint-disable @typescript-eslint/indent */
import { JSONSchemaType } from 'ajv';

import { Entity } from '../entity/Base.js';
import { Metadata } from '../Metadata.js';
import { BaseTemplate, TEMPLATE_STRING_SCHEMA, TemplateNumber, TemplateRef, TemplateString } from './Template.js';

export type ModifierMetadata = BaseTemplate<Omit<Metadata, 'id' | 'template'>>;

export type ModifierPrimitive<TBase> =
  TBase extends number ? TemplateNumber :
  TBase extends string ? TemplateString :
  TBase extends Metadata ? ModifierMetadata :
  TBase extends Array<Entity> ? Array<TemplateRef> :
  TBase extends Array<infer TValue> ? Array<ModifierPrimitive<TValue>> :
  TBase extends Map<infer TKey, infer TValue> ? Map<TKey, ModifierPrimitive<TValue>> :
  // eslint-disable-next-line @typescript-eslint/ban-types
  TBase extends object ? BaseModifier<TBase> :
  never;

export type BaseModifier<TBase> = {
  [TKey in keyof TBase]: ModifierPrimitive<TBase[TKey]>;
};

export interface Modifier<TEntity> {
  // base: BaseModifier<TEntity>;
  base: Partial<BaseModifier<TEntity>>;

  /**
   * Chance of this modifier appearing.
   */
  chance: number;

  /**
   * Other modifiers that cannot appear with this one.
   */
  excludes: Array<string>;

  id: string;
}

export const MODIFIER_METADATA_SCHEMA: JSONSchemaType<ModifierMetadata> = {
  type: 'object',
  properties: {
    desc: TEMPLATE_STRING_SCHEMA,
    name: TEMPLATE_STRING_SCHEMA,
  },
  required: ['desc', 'name'],
};
