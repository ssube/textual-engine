import { expect } from 'chai';
import { render } from 'ink-testing-library';
import * as React from 'react';
import { stub } from 'sinon';

import { Frame } from '../../../src/component/ink/Frame';
import { zeroStep } from '../../../src/util/entity';
import { KEY_ARROW_DOWN, KEY_ENTER, KEY_TAB } from '../../constants';
import { sendKeys } from './helper';

describe('ink frame component', () => {
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

    const { lastFrame } = render(root);
    const frame = lastFrame();

    expect(frame).to.include(prompt);
  });

  it('should show the quit notice', async () => {
    const onLine = stub();
    const root = React.createElement(Frame, {
      onLine,
      prompt: 'foo',
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

    const { lastFrame } = render(root);
    const frame = lastFrame();

    expect(frame).to.include('Game Over').and.not.to.include('foo');
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

    const { lastFrame, stdin } = render(root);

    await sendKeys(stdin, 10, [
      KEY_TAB,        // input
      'a',
      'b',
      KEY_ENTER,      // submit
    ]);

    lastFrame(); // render and stuff

    expect(onLine).to.have.callCount(1).and.been.calledWith('ab');
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
        items: [{
          id: 'd',
          name: 'D',
        }],
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

    const { lastFrame, stdin } = render(root);

    await sendKeys(stdin, 10, [
      KEY_TAB,        // input
      'a',
      'b',
      KEY_TAB,        // tabs
      KEY_TAB,        // shortcuts
      KEY_ENTER,      // append actor
      KEY_TAB,        // cycle through input
      KEY_TAB,        // back to tabs
      KEY_ARROW_DOWN, // items tab
      KEY_ENTER,      // select tab
      KEY_TAB,        // shortcuts
      KEY_ENTER,      // append item
      KEY_TAB,        // back to input
      KEY_ENTER,      // submit
    ]);

    lastFrame(); // render and stuff

    expect(onLine).to.have.been.calledWith('ab c d');
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
    });

    const { lastFrame, stdin } = render(root);

    await sendKeys(stdin, 10, [
      KEY_TAB,        // input
      'a',
      'b',
      KEY_TAB,        // tabs
      KEY_ARROW_DOWN, // items tab
      KEY_ARROW_DOWN, // portals tab
      KEY_ARROW_DOWN, // verbs tab
      KEY_ENTER,      // select tab
      KEY_TAB,        // shortcuts
      KEY_ENTER,      // append verb
      KEY_TAB,        // back to input
      KEY_ENTER,      // submit
    ]);

    lastFrame(); // render and stuff

    expect(onLine).to.have.been.calledWith('c');
  });
});
