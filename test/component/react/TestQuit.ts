import { expect } from 'chai';
import * as React from 'react';
import TestRenderer from 'react-test-renderer';
import { stub } from 'sinon';

import { Quit } from '../../../src/component/react/Quit';
import { getReactStrings } from './helper';

describe('react quit component', () => {
  it('should show game over message', async () => {
    const select = stub();
    const root = React.createElement(Quit, {
      actors: [],
      items: [],
      portals: [],
      verbs: [],
      onSelect: select,
    });
    const renderer = TestRenderer.create(root);
    const strings = getReactStrings(renderer.root);

    expect(strings).to.include('Game Over');
  });
});
