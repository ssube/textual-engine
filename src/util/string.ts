import { doesExist } from '@apextoaster/js-utils';

/**
 * String has non-whitespace characters.
 */
export function hasText(str: string): boolean {
  return doesExist(str) && (str.length > 0) && (/^\s*$/.test(str) === false);
}
