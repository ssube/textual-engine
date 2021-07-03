import { expect } from 'chai';
import * as React from 'react';
import TestRenderer from 'react-test-renderer';
import { stub } from 'sinon';

import { Frame } from '../../../src/component/react/Frame';
import { zeroStep } from '../../../src/util/entity';
import { getReactStrings } from './helper';

describe('react frame component', () => {
  it('should show the prompt', async () => {
    const prompt = 'foo';
    const root = React.createElement(Frame, {
      onLine: stub(),
      prompt,
      output: [],
      quit: false,
      shortcuts: {
        actors: [],
        items: [],
        portals: [],
        verbs: [],
      },
      show: {
        shortcuts: true,
        status: true,
      },
      stats: [],
      step: zeroStep(),
    });

    const renderer = TestRenderer.create(root);
    const strings = getReactStrings(renderer.root);

    expect(strings).to.include(prompt);
  });

  it('should show the quit notice', async () => {
    const prompt = 'foo';
    const root = React.createElement(Frame, {
      onLine: stub(),
      prompt,
      output: [],
      quit: true,
      shortcuts: {
        actors: [],
        items: [],
        portals: [],
        verbs: [],
      },
      show: {
        shortcuts: true,
        status: true,
      },
      stats: [],
      step: zeroStep(),
    });

    const renderer = TestRenderer.create(root);
    const strings = getReactStrings(renderer.root);

    expect(strings).to.include('Game Over').and.not.to.include(prompt);
  });

  it('should update the line', async () => {
    const onLine = stub();
    const root = React.createElement(Frame, {
      onLine,
      prompt: 'foo',
      output: [],
      quit: false,
      shortcuts: {
        actors: [],
        items: [],
        portals: [],
        verbs: [],
      },
      show: {
        shortcuts: true,
        status: true,
      },
      stats: [],
      step: zeroStep(),
    });

    const renderer = TestRenderer.create(root);

    const input = renderer.root.findByProps({ id: 'input-line' });
    input.props.onChange({
      target: {
        value: 'bar',
      }
    });

    const submit = renderer.root.findByProps({ id: 'input-form' });
    submit.props.onSubmit({
      preventDefault: stub(),
    });

    const strings = getReactStrings(renderer.root);

    expect(strings).to.include('foo');
  });
});
