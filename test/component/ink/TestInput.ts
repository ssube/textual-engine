import { expect } from 'chai';
import { render } from 'ink-testing-library';
import * as React from 'react';
import sinon from 'sinon';

import { Input } from '../../../src/component/ink/Input.js';

const { stub } = sinon;
describe('ink input component', () => {
  it('should show the prompt', async () => {
    const prompt = 'foo';
    const root = React.createElement(Input, {
      line: '',
      prompt,
      onChange: stub(),
      onLine: stub(),
    });

    const { lastFrame } = render(root);
    const frame = lastFrame();

    expect(frame).to.include(prompt);
  });
});
