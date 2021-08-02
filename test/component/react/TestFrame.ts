import { expect } from 'chai';
import * as React from 'react';
import TestRenderer from 'react-test-renderer';
import sinon from 'sinon';

import { Frame } from '../../../src/component/react/Frame.js';
import { META_CREATE } from '../../../src/util/constants.js';
import { zeroStep } from '../../../src/util/entity/index.js';
import { getReactStrings } from './helper.js';

const { stub } = sinon;
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
      worlds: [],
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
      worlds: [],
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
      worlds: [],
    });

    const renderer = TestRenderer.create(root);

    const input = renderer.root.findByProps({ id: 'input-line' });
    input.props.onChange({
      target: {
        value: 'bar',
      }
    });

    renderer.update(root); // needed to update the contents of the input

    const submit = renderer.root.findByProps({ id: 'input-form' });
    submit.props.onSubmit({
      preventDefault: stub(),
    });

    expect(onLine).to.have.been.calledWith('bar');
  });

  it('should append entity shortcuts to the line', async () => {
    const onLine = stub();
    const root = React.createElement(Frame, {
      onLine,
      prompt: 'foo',
      output: [],
      quit: false,
      shortcuts: {
        actors: [{
          id: 'c',
          name: 'C',
        }],
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
      worlds: [],
    });

    const renderer = TestRenderer.create(root);

    const input = renderer.root.findByProps({ id: 'input-line' });
    input.props.onChange({
      target: {
        value: 'ab',
      }
    });

    const shortcut = renderer.root.findByProps({ id: 'item-c' });
    shortcut.props.onClick();

    const submit = renderer.root.findByProps({ id: 'input-form' });
    submit.props.onSubmit({
      preventDefault: stub(),
    });

    expect(onLine).to.have.been.calledWith('ab c');
  });

  it('should replace the line with verb shortcuts', async () => {
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
        verbs: [{
          id: 'c',
          name: 'C',
        }],
      },
      show: {
        shortcuts: true,
        status: true,
      },
      stats: [],
      step: zeroStep(),
      worlds: [],
    });

    const renderer = TestRenderer.create(root);

    const input = renderer.root.findByProps({ id: 'input-line' });
    input.props.onChange({
      target: {
        value: 'ab',
      }
    });

    const tab = renderer.root.findByProps({ id: 'tab-verbs' });
    tab.props.onClick();

    const shortcut = renderer.root.findByProps({ id: 'item-c' });
    shortcut.props.onClick();

    const submit = renderer.root.findByProps({ id: 'input-form' });
    submit.props.onSubmit({
      preventDefault: stub(),
    });

    expect(onLine).to.have.been.calledWith('c');
  });

  it('should replace the line for world shortcuts', async () => {
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
      worlds: [{
        id: 'foo',
        name: {
          base: 'Foo',
          type: 'string',
        },
        desc: {
          base: 'bar',
          type: 'string',
        },
      }],
    });

    const renderer = TestRenderer.create(root);

    const input = renderer.root.findByProps({ id: 'input-line' });
    input.props.onChange({
      target: {
        value: 'ab',
      }
    });

    const shortcut = renderer.root.findByProps({ id: 'world-menu' });
    shortcut.props.onChange({
      target: {
        value: 'foo',
      }
    });

    const submit = renderer.root.findByProps({ id: 'input-form' });
    submit.props.onSubmit({
      preventDefault: stub(),
    });

    expect(onLine).to.have.been.calledWith(`${META_CREATE} foo with test seed and 10`);
  });
});
