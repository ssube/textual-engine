import TestRenderer from 'react-test-renderer';

export function getReactStrings(elem: TestRenderer.ReactTestInstance): Array<string> {
  const strings = [];
  for (const child of elem.children) {
    if (typeof child === 'string') {
      strings.push(child);
    } else {
      strings.push(...getReactStrings(child));
    }
  }
  return strings;
}
