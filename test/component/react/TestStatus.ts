import { expect } from 'chai';
import * as React from 'react';
import TestRenderer from 'react-test-renderer';

import { Status } from '../../../src/component/react/Status.js';
import { STAT_HEALTH } from '../../../src/util/constants.js';
import { getReactStrings } from './helper.js';

describe('react quit component', () => {
  it('should show game over message', async () => {
    const root = React.createElement(Status, {
      stats: [{
        name: STAT_HEALTH,
        value: 10,
      }],
    });

    const renderer = TestRenderer.create(root);
    const strings = getReactStrings(renderer.root);

    expect(strings).to.include('health').and.to.include('10');
  });
});
