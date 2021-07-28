import { expect } from 'chai';
import * as React from 'react';
import TestRenderer from 'react-test-renderer';
import { stub } from 'sinon';

import { Input } from '../../../src/component/react/Input.js';
import { getReactStrings } from './helper.js';

describe('react output component', () => {
  it('should show the provided output', async () => {
    const prompt = 'foo';
    const root = React.createElement(Input, {
      line: '',
      prompt,
      onChange: stub(),
      onLine: stub(),
    });
    const renderer = TestRenderer.create(root);
    const strings = getReactStrings(renderer.root);

    expect(strings).to.include(prompt);
  });
});
