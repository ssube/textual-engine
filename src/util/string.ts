import { doesExist } from '@apextoaster/js-utils';

import { SPLIT_HEAD_TAIL } from './constants';

/**
 * String has non-whitespace characters.
 */
export function hasText(str: string): boolean {
  return doesExist(str) && (str.length > 0) && (/^\s*$/.test(str) === false);
}

export function matchIdSegments(value: string, filter: string): boolean {
  const valueParts = value.split('-');
  const filterParts = filter.split('-');

  if (valueParts.length < filterParts.length) {
    return false;
  }

  return filterParts.every((it, idx) => it === valueParts[idx]);
}

export function splitPath(path: string): {
  protocol?: string;
  path: string;
} {
  if (path.includes('://') === false) {
    return { path };
  }

  const [protocol, rest] = path.split('://', SPLIT_HEAD_TAIL);
  return {
    protocol,
    path: rest,
  };
}

export function trim(str: string): string {
  return str
    .replace(/^\s+/, '')
    .replace(/\s+$/, '');
}
