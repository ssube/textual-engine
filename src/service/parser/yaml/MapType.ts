import { Type as YamlType } from 'js-yaml';

/**
 * @public
 */
export const mapType = new YamlType('!map', {
  kind: 'mapping',
  construct(data: any) {
    return new Map(Object.entries(data))
  },
  instanceOf: Map,
  represent(data: any) {
    return Object.fromEntries(data);
  },
});
