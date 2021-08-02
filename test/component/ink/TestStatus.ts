import { expect } from 'chai';
import { render } from 'ink-testing-library';
import * as React from 'react';

import { Status } from '../../../src/component/ink/Status.js';
import { STAT_HEALTH } from '../../../src/util/constants.js';

describe('ink status component', () => {
  it('should show stats', async () => {
    const root = React.createElement(Status, {
      stats: [{
        name: STAT_HEALTH,
        value: 10,
      }],
    });

    const { lastFrame } = render(root);
    const frame = lastFrame();

    expect(frame).to.include('health: 10');
  });
});
