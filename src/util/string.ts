/**
 * String has non-whitespace characters.
 */
export function hasText(str: string): boolean {
  return str.length > 0 && /^\s*$/.test(str) === false;
}
