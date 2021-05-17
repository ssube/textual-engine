import { JSONSchemaType } from 'ajv';
import { Entity } from '../entity/Base';
import { Metadata } from './Metadata';

export interface TemplateNumber {
  type: 'number';
  max: number;
  min: number;
}

/**
 * A template string.
 *
 * Template string literal types are a strange idea, but needed to make string schemas typesafe, until constant string
 * fields are removed from templates.
 */
export interface TemplateString<TBase extends string = string> {
  type: 'string';
  base: TBase;
}

export interface TemplateRef {
  type: 'id';
  id: string;
}

export type TemplatePrimitive<TBase> =
  TBase extends number ? TemplateNumber :                                               // number -> range
  TBase extends string ? TemplateString :                                               // string -> template
  TBase extends Metadata ? BaseTemplate<Omit<Metadata, 'template'>> :                   // Metadata + template -> Metadata
  TBase extends Entity ? TemplateRef :                                                  // entity -> id
  TBase extends Array<Entity> ? Array<TemplateRef> :                                    // Array<entity> -> Array<id>
  TBase extends Array<infer TValue> ? Array<TemplatePrimitive<TValue>> :                // Array<TValue> -> Array<Template<TValue>>
  TBase extends Map<infer TKey, infer TValue> ? Map<TKey, TemplatePrimitive<TValue>> :  // Map<TKey, TValue> -> Map<TKey, Template<TValue>>
  TBase extends object ? BaseTemplate<TBase> :                                          // {[TKey]: TValue] -> {[TKey]: Template<TValue>}
  never;

export type BaseTemplate<TBase> = {
  [TKey in keyof TBase]: TemplatePrimitive<TBase[TKey]>;
};

export interface Template<TBase> {
  base: BaseTemplate<TBase>;
  // mods: Array<Modifier>;
}

export const TEMPLATE_STRING_SCHEMA: JSONSchemaType<TemplateString> = {
  type: 'object',
  properties: {
    base: {
      type: 'string',
    },
    type: {
      type: 'string',
      default: 'string',
    },
  },
  required: ['base'],
};

export const TEMPLATE_REF_SCHEMA: JSONSchemaType<TemplateRef> = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
    },
    type: {
      type: 'string',
      default: 'id',
    },
  },
  required: ['id'],
};
