import { envType, streamType } from '@apextoaster/js-yaml-schema';
import { DEFAULT_SCHEMA, Schema } from 'js-yaml';

import { mapType } from '../../service/parser/yaml/MapType.js';

export function makeParserSchema(): Schema {
  return DEFAULT_SCHEMA.extend([
    envType,
    mapType,
    streamType,
  ]);
}
