import { JSONSchemaType } from 'ajv';

import { Command } from '../../service/input';
import { WorldEntity } from '../entity';
import { Portal } from '../entity/Portal';

export type LocaleContext = Record<string, number | string | WorldEntity | Portal | Command>;
export type LocaleLanguage = Record<string, Record<string, string>>;

export interface LocaleBundle {
  bundles: LocaleLanguage;
}

export const LOCALE_SCHEMA: JSONSchemaType<LocaleBundle> = {
  type: 'object',
  properties: {
    bundles: {
      type: 'object',
      required: [],
      additionalProperties: true,
      patternProperties: {
        '.*': {
          type: 'object',
          required: [],
        },
      },
    },
  },
  required: ['bundles'],
};
