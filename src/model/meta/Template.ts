import { JSONSchemaType } from 'ajv';
import { Entity } from '../entity/Base';
import { Metadata } from './Metadata';

export interface TemplateNumber {
  type: 'number';
  max: number;
  min: number;
}

export interface TemplateString<T extends string = string> {
  type: 'string';
  base: T;
}

export interface TemplateRef {
  type: 'id';
  id: string;
}

export type TemplatePrimitive<T> =
  T extends number ? TemplateNumber :                               // number -> range
  T extends string ? TemplateString :                               // string -> template
  T extends Metadata ? BaseTemplate<Omit<Metadata, 'template'>> :   // Metadata + template -> Metadata
  T extends Entity ? TemplateRef :                                  // entity -> id
  T extends Array<Entity> ? Array<TemplateRef> :                    // Array<entity> -> Array<id>
  T extends Array<infer V> ? Array<TemplatePrimitive<V>> :          // Array<V> -> Array<Template<V>>
  T extends Map<infer K, infer V> ? Map<K, TemplatePrimitive<V>> :  // Map<K, V> -> Map<K, Template<V>>
  T extends object ? BaseTemplate<T> :                              // {[K]: V] -> {[K]: Template<V>}
  never;

export type BaseTemplate<T> = {
  [K in keyof T]: TemplatePrimitive<T[K]>;
};

export interface Template<T> {
  base: BaseTemplate<T>;
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
