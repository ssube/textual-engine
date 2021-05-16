import { Type as YamlType } from 'js-yaml';

/**
 * @public
 */
export const mapType = new YamlType('!map', {
  kind: 'mapping',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  construct(data: any) {
    return new Map(Object.entries(data));
  },
  instanceOf: Map,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  represent(data: any) {
    return Object.fromEntries(data);
  },
});
