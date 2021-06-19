import { expect } from 'chai';
import { render } from 'ink-testing-library';
import * as React from 'react';
import { stub } from 'sinon';

import { Quit } from '../../../src/component/ink/Quit';

describe('ink quit component', () => {
  it('should show game over message', async () => {
    const select = stub();
    const root = React.createElement(Quit, {
      actors: [],
      items: [],
      portals: [],
      verbs: [],
      onSelect: select,
    });

    const { lastFrame } = render(root);
    const frame = lastFrame();

    expect(frame).to.include('Game Over');
  });
});
