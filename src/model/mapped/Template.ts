/* eslint-disable @typescript-eslint/indent */
import { JSONSchemaType } from 'ajv';

import { TEMPLATE_CHANCE } from '../../util/constants.js';
import { Replace } from '../../util/types.js';
import { Entity } from '../entity/Base.js';
import { Metadata } from '../Metadata.js';
import { ScriptRef } from '../Script.js';
import { Modifier } from './Modifier.js';

export interface TemplateNumber {
  type: 'number';
  max: number;
  min: number;
  step: number;
}

/**
 * A template string.
 *
 * Template string literal types are a strange idea, but needed to make string schemas and templates fully typesafe.
 */
export interface TemplateString<TBase extends string = string> {
  type: 'string';
  base: TBase;
}

export type TemplateMetadata = Replace<BaseTemplate<Omit<Metadata, 'template'>>, 'id', string>;

export interface TemplateRef {
  type: 'id';
  chance: number;
  id: string;
}

export type TemplatePrimitive<TBase> =
  TBase extends number ? TemplateNumber :                                               // number -> range
  TBase extends string ? TemplateString :                                               // string -> template
  TBase extends Metadata ? TemplateMetadata :                                           // Metadata + template -> Metadata
  TBase extends Entity ? TemplateRef :                                                  // entity -> id
  TBase extends Array<Entity> ? Array<TemplateRef> :                                    // Array<entity> -> Array<id>
  TBase extends Array<infer TValue> ? Array<TemplatePrimitive<TValue>> :                // Array<TValue> -> Array<Template<TValue>>
  TBase extends Map<infer TKey, infer TValue> ? Map<TKey, TemplatePrimitive<TValue>> :  // Map<TKey, TValue> -> Map<TKey, Template<TValue>>
  // eslint-disable-next-line @typescript-eslint/ban-types
  TBase extends object ? BaseTemplate<TBase> :                                          // {[TKey]: TValue] -> {[TKey]: Template<TValue>}
  never;

export type BaseTemplate<TBase> = {
  [TKey in keyof TBase]: TemplatePrimitive<TBase[TKey]>;
};

export interface Template<TBase> {
  base: BaseTemplate<TBase>;
  mods: Array<Modifier<TBase>>;
}

export const TEMPLATE_NUMBER_SCHEMA: JSONSchemaType<TemplateNumber> = {
  type: 'object',
  properties: {
    max: {
      type: 'number',
    },
    min: {
      type: 'number',
      default: 0,
    },
    step: {
      type: 'number',
      default: 1,
    },
    type: {
      type: 'string',
      const: 'number',
      default: 'number',
    },
  },
  required: ['max'],
};

export const TEMPLATE_STRING_SCHEMA: JSONSchemaType<TemplateString> = {
  type: 'object',
  properties: {
    base: {
      type: 'string',
    },
    type: {
      type: 'string',
      const: 'string',
      default: 'string',
    },
  },
  required: ['base'],
};

export const TEMPLATE_REF_SCHEMA: JSONSchemaType<TemplateRef> = {
  type: 'object',
  properties: {
    chance: {
      type: 'number',
      default: TEMPLATE_CHANCE,
    },
    id: {
      type: 'string',
    },
    type: {
      type: 'string',
      const: 'id',
      default: 'id',
    },
  },
  required: ['id'],
};

export const TEMPLATE_SCRIPT_SCHEMA: JSONSchemaType<BaseTemplate<ScriptRef>> = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      map: {
        keys: {
          type: 'string',
        },
        values: {
          type: 'object',
          discriminator: {
            propertyName: 'type',
          },
          required: ['type'],
          oneOf: [
            TEMPLATE_NUMBER_SCHEMA,
            TEMPLATE_STRING_SCHEMA,
          ],
        },
      },
      required: [],
    },
    name: TEMPLATE_STRING_SCHEMA,
  },
  required: ['data', 'name'],
};
