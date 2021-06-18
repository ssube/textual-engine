import { expect } from 'chai';
import { render } from 'ink-testing-library';
import * as React from 'react';

import { Output } from '../../../src/component/ink/Output';

describe('ink output component', () => {
  it('should show the provided output', async () => {
    const output = ['foo'];
    const root = React.createElement(Output, {
      output,
    });

    const { lastFrame } = render(root);
    const frame = lastFrame();

    for (const line of output) {
      expect(frame, `line: ${line}`).to.include(line);
    }
  });
});
