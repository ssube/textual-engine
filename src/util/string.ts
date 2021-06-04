import { doesExist } from '@apextoaster/js-utils';

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

  const [protocol, rest] = path.split('://', 2);
  return {
    protocol,
    path: rest,
  };
}
