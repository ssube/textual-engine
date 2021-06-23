import { expect } from 'chai';
import * as React from 'react';
import TestRenderer from 'react-test-renderer';

import { Output } from '../../../src/component/react/Output';
import { getReactStrings } from './helper';

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
