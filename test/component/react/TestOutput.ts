import { expect } from 'chai';
import * as React from 'react';
import TestRenderer from 'react-test-renderer';

import { Output } from '../../../src/component/react/Output';

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

describe('react output component', () => {
  it('should show the provided output', async () => {
    const output = ['foo'];
    const root = React.createElement(Output, {
      output,
    });
    const renderer = TestRenderer.create(root);
    const strings = getReactStrings(renderer.root);

    for (const line of output) {
      expect(strings, `line: ${line}`).to.include(line);
    }
  });
});
